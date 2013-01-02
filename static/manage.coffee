$ ->
  String::endswith = (s) ->
    @length >= s.length && @substr(@length - s.length) == s

  window.XSSReport = do ->
    class @PaginatedCollection extends Backbone.Paginator.requestPager
      currentPage: 0
      parse: (response) ->
        @response_meta = response.meta
        return response.objects

      hasNextPage: =>
        if @response_meta
          return @response_meta.next.length > 0
        return false

      hasPreviousPage: =>
        if @response_meta
          return @response_meta.previous.length > 0
        return false

    class @ScriptModel extends Backbone.Model
      urlRoot: '/api/script/'
      defaults: ->
        name: "new name"
        uri: Math.random().toString(36).substr(2,6)
        short_url: ""
        source: "\n"
        compiled: "\n"

    class @ScriptCollection extends @PaginatedCollection
      model: ScriptModel
      paginator_core:
        type: 'GET'
        dataType: 'json'
        url: '/api/script/'
      paginator_ui:
        firstPage: 0
        currentPage: 0
        perPage: 20
        totalPages: 10
      server_api:
        'page': -> @currentPage

    class @ReportModel extends Backbone.Model
      urlRoot: '/api/report/'

    class @ReportCollection extends @PaginatedCollection
      model: ReportModel
      paginator_core:
        type: 'GET'
        dataType: 'json'
        url: '/api/report/'
      paginator_ui:
        firstPage: 0
        currentPage: 0
        perPage: 100
        totalPages: 10
      server_api:
        'page': -> @currentPage
        'uri': -> @uri

    class @ScriptEditView extends Backbone.View
      tagName: 'div'
      className: 'script-edit-view'
      initialize: =>
        @template = _.template $('#script-edit-template').text()
        @model.on "change", @render
        @throttledSaveSource = _.throttle(@saveSourceToLocalStorage, 2000)

      events:
        "click a.compile"         :   "compile"
        "click a.compress"        :   "compress"
        "click a.run"             :   "run"
        "click a.save"            :   "save"
        "click a.shorten-google"  :   "shortenGoogle"

      constructLongURL : =>
        "http://xssreport.herokuapp.com/x/" + @model.get('uri') + '/'

      createShortURL : (service) =>
        window.XSSReport.app.shorten @constructLongURL(), service, (result) =>
          if result != "error"
            @$el.find("input#short-url").val(result)

      shortenGoogle : (e) =>
        e.preventDefault()
        @createShortURL "google"

      compile : (e) =>
        e.preventDefault()
        try
          compiled = CoffeeScript.compile @editor.getValue()
          @compiled_view.setValue(compiled)
        catch error
          @$el.find('#error').text(error.message).show()

      run : (e) =>
        e.preventDefault()
        try
          eval(@compiled_view.getValue())
          @$el.find('#error').hide()
        catch e
          @$el.find('#error').text(error.message).show()
      
      compress : (e) =>
        e.preventDefault()
        @compiled_view.setValue uglify(@compiled_view.getValue())

      save : (e) =>
        e.preventDefault()
        @model.set("name", @$el.find("input#name").val())
        @model.set("uri", @$el.find("input#uri").val())
        @model.set("short_url", @$el.find("input#short-url").val())
        @model.set("source", @editor.getValue())
        @model.set("compiled", @compiled_view.getValue())
        @model.save null,
          error: (jqXHR, textStatus, errorThrown) =>
            console.log(textStatus)
            console.log(errorThrown)
            @$el.find('#error').text(errorThrown).show()
          success: (data, textStatus, jqXHR) =>
            window.XSSReport.app.showMessage("Saved.")
            @model.fetch null,
              error: (jqXHR, textStatus, errorThrown) =>
                console.log(textStatus)
                console.log(errorThrown)
                @$el.find('#error').text(errorThrown).show()
              success: (data, textStatus, jqXHR) =>
                @$el.find('#error').hide()

      saveSourceToLocalStorage : =>
        content = @editor.getValue()
        localStorage["lastSourceContent"] = content

      render: =>
        @$el.empty()
        @$el.append @template(@model.toJSON())
        @editor = CodeMirror.fromTextArea @$el.find('.code-editor')[0],
          onKeyEvent: (editor, e) =>
            @throttledSaveSource()
            return
          lineNumbers: true
          mode: "coffeescript"
        if @editor.getValue().length == 0
          @editor.setValue("\n")
        @compiled_view = CodeMirror.fromTextArea @$el.find('.compiled')[0],
          lineNumbers: true
          mode: "javascript"
          readOnly: true
        if @compiled_view.getValue().length == 0
          @compiled_view.setValue("\n")
        @$el.find(".CodeMirror-scroll").hover -> 
          $(@).get(0).style.cursor = "text"

        _.delay =>
          @editor.setValue @model.get("source")
          @compiled_view.setValue @model.get("compiled")
        , 200

    class @ScriptsListView extends Backbone.View
      tagName: 'div'
      className: 'scripts-list-view'

      events:
        "click a.edit-script"         :   "editScript"
        "click a.use-script"          :   "useScript"
        "click a.remove-script"       :   "removeScript"
        "click a.duplicate-script"    :   "duplicateScript"
        "click a.previous-page"       :   "previousPage"
        "click a.next-page"           :   "nextPage"
        "click a.add-script"          :   "createNewScript"
        "click a.refresh"             :   "refresh"

      initialize: =>
        @template = _.template $('#scripts-list-template').text()
        @usage_template = _.template $('#script-usage-template').text()
        @collection.on 'reset', @render
        @collection.goTo(0)

      editScript: (e) =>
        e.preventDefault()
        model_id = parseInt($(event.target).parents("tr").data("id"))
        model = @collection.get model_id
        view = new ScriptEditView(model: model)
        view.render()
        window.XSSReport.app.navigate("scripts/edit/" + model_id)
        window.XSSReport.app.showView(view)

      useScript: (e) =>
        e.preventDefault()
        model_id = parseInt($(event.target).parents("tr").data("id"))
        model = @collection.get model_id

        modal = @$el.find(".modal")
        modal.empty()
        modal.append @usage_template(model.toJSON())
        modal.find('pre code').each (i, e) ->
          hljs.highlightBlock(e)
        modal.modal()

      removeScript: (e) =>
        e.preventDefault()
        model_id = parseInt($(event.target).parents("tr").data("id"))
        model = @collection.get model_id

        if model and confirm 'Are you sure to delete "' + model.get('uri') + '"?'
          model.destroy success: =>
              @collection.fetch()

      duplicateScript: (e) =>
        e.preventDefault()
        model_id = parseInt($(event.target).parents("tr").data("id"))
        model = @collection.get model_id

        new_model = new ScriptModel(_.omit(model.toJSON(), "id"))
        window.XSSReport.app.navigate("scripts/new")
        window.XSSReport.app.newScript(new_model)

      previousPage: (e) =>
        e.preventDefault()
        if @collection.hasPreviousPage()
          @collection.requestPrevious()

      nextPage: (e) =>
        e.preventDefault()
        if @collection.hasPreviousPage()
          @collection.requestNext()

      createNewScript: (e) =>
        e.preventDefault()
        window.XSSReport.app.navigate("scripts/new", trigger: true)

      refresh: (e) =>
        e.preventDefault()
        @collection.fetch()

      render: =>
        @$el.empty()
        @$el.append @template
          items: @collection.toJSON()

        @$el.find(".next-page").parent().toggleClass "disabled", ! @collection.hasNextPage()
        @$el.find(".previous-page").parent().toggleClass "disabled", ! @collection.hasPreviousPage()

    class @ReportsListView extends Backbone.View
      events:
        "click a.previous-page"       :   "previousPage"
        "click a.next-page"           :   "nextPage"

      initialize: =>
        @template = _.template $('#reports-list-template').text()
        @collection.on "reset", @render
        @collection.fetch()

      previousPage: (e) =>
        e.preventDefault()
        if @collection.hasPreviousPage()
          @collection.requestPrevious()

      nextPage: (e) =>
        e.preventDefault()
        if @collection.hasPreviousPage()
          @collection.requestNext()
   
      render: =>
        @$el.empty()
        @$el.append @template
          items: @collection.toJSON()

    class @MainApp extends Backbone.Router
      routes:
        "scripts"           :  "showScripts"
        "scripts/new"       :  "newScript"
        "scripts/edit/:id"  :  "editScript"
        "reports/:uri" :  "showReports"
        ""                  :  "redirectDefault"

      initialize: =>
        @$el = $('.app')
        @$el.ajaxStart =>
          @$el.spin("large", "white")
        @$el.ajaxStop =>
          @$el.spin(false);

        # fix Backbone's lack of trailing slash. 
        @$el.ajaxSend (e, jqxhr, settings) =>
          if not settings.url.endswith("/")
            settings.url += "/"

      showView: (@view) =>
        @$el.empty()
        @$el.append(@view.el)
      
      showScripts: =>
        collection = new ScriptCollection()
        view = new ScriptsListView(collection: collection)
        view.render()
        @showView(view)

      newScript: (_model) =>
        model = _model || new ScriptModel()
        view = new ScriptEditView(model: model)
        view.render()
        @showView(view)

      editScript: (id) =>
        model = new ScriptModel(id: parseInt(id))
        view = new ScriptEditView(model: model)
        model.fetch()
        @showView(view)

      showReports: (uri) =>
        collection = new ReportCollection()
        collection.uri = uri
        view = new ReportsListView(collection: collection)
        view.render()
        @showView(view)

      redirectDefault: =>
        @navigate("scripts", trigger: true)

      showMessage: (msg, timeout) =>
        $('.global-flash').text(msg).show()

      shorten: (long, service, @callback) =>
        if service == "google"
          $.ajax
            url : "https://www.googleapis.com/urlshortener/v1/url"
            data : JSON.stringify(longUrl:long)
            type : "POST"
            dataType : "json"
            contentType : 'application/json'
            success : (data, textStatus, jqXHR) =>
              @callback(data.id)
            error : =>
              @callback("error")

    app: new @MainApp()
  Backbone.history.start({pushState: false})
