$ ->
  String::endswith = (s) ->
    @length >= s.length && @substr(@length - s.length) == s

  window.XSSReport = do ->
    class @PaginatedCollection extends Backbone.Paginator.requestPager
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

      paginator_ui:
        firstPage: 1
        currentPage: 1
        perPage: 20
        totalPages: 10

    class @ScriptModel extends Backbone.Model
      urlRoot: '/api/script/'
      defaults: ->
        name: "new name"
        uri: Math.random().toString(36).substr(2,6)
        short_url: ""
        source: "\n"
        compiled: "\n"

      save : ->
        @unset("created")
        @unset("last_edited")
        super

    class @ScriptCollection extends @PaginatedCollection
      model: ScriptModel
      paginator_core:
        type: 'GET'
        dataType: 'json'
        url: '/api/script/'
      server_api:
        'page': -> @currentPage

    class @ReportModel extends Backbone.Model
      urlRoot: '/api/report/'

      save : ->
        @unset("created")
        super

    class @ReportCollection extends @PaginatedCollection
      model: ReportModel
      paginator_core:
        type: 'GET'
        dataType: 'json'
        url: '/api/report/'
      paginator_ui:
        firstPage: 1
        currentPage: 1
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
        @model.set("source", @editor.getValue())
        @model.set("compiled", @compiled_view.getValue())
        @model.set("name", @$el.find("input#name").val())
        @model.set("uri", @$el.find("input#uri").val())
        @model.set("short_url", @$el.find("input#short-url").val())
        @model.save null,
          error: (jqXHR, textStatus, errorThrown) =>
            console.log(textStatus)
            console.log(errorThrown)
            @$el.find('#error').text(errorThrown).show()
          success: (data, textStatus, jqXHR) =>
            window.XSSReport.app.showMessage("Saved.")
            window.XSSReport.app.navigate("scripts/edit/" + @model.get("id"))

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
          lineWrapping: true
        if @compiled_view.getValue().length == 0
          @compiled_view.setValue("\n")
        @$el.find(".CodeMirror-scroll").hover -> 
          $(@).get(0).style.cursor = "text"
        _.defer =>
          @editor.setValue @model.get("source")
          @compiled_view.setValue @model.get("compiled")

    class @ScriptsListView extends Backbone.View
      tagName: 'div'
      className: 'scripts-list-view'

      events:
        "click a.edit-script"         :   "editScript"
        "click a.use-script"          :   "useScript"
        "click a.remove-script"       :   "removeScript"
        "click a.duplicate-script"    :   "duplicateScript"
        "click a.show-reports"        :   "showReports"
        "click a.previous-page"       :   "previousPage"
        "click a.next-page"           :   "nextPage"
        "click a.add-script"          :   "createNewScript"
        "click a.refresh"             :   "refresh"
        "click .save-new-script"      :   "saveNewScript"
        "click .create-custom-script" :   "createCustomScript"

      initialize: =>
        @template = _.template $('#scripts-list-template').text()
        @usage_template = _.template $('#script-usage-template').text()
        @new_script_template = _.template $('#new-script-template').text()
        @xss_script_template = _.template $('#xss-general-template').text()
        @collection.on 'reset', @render
        @collection.goTo(1)

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
            @collection.goTo(@collection.currentPage)

      duplicateScript: (e) =>
        e.preventDefault()
        model_id = parseInt($(event.target).parents("tr").data("id"))
        model = @collection.get model_id

        new_model = new ScriptModel(_.omit(model.toJSON(), "id", "created", "last_edited"))
        window.XSSReport.app.navigate("scripts/new")
        window.XSSReport.app.newScript(new_model)

      showReports: (e) =>
        e.preventDefault()
        model_id = parseInt($(event.target).parents("tr").data("id"))
        model = @collection.get model_id
        window.XSSReport.app.navigate("reports/" + model.get("uri"), trigger: true)

      previousPage: (e) =>
        e.preventDefault()
        if @collection.hasPreviousPage()
          @collection.requestPreviousPage()

      nextPage: (e) =>
        e.preventDefault()
        if @collection.hasNextPage()
          @collection.requestNextPage()

      createNewScript: (e) =>
        e.preventDefault()
        modal = @$el.find(".modal")
        modal.empty()
        modal.append @new_script_template()
        modal.find('pre code').each (i, e) ->
          hljs.highlightBlock(e)
        modal.modal()
        modal.find('input#uri').bind 'input', @updateNewScript

      createCustomScript: (e) =>
        e.preventDefault()
        @$el.find(".modal").one 'hidden', =>
          window.XSSReport.app.navigate("scripts/new", trigger: true)
        @$el.find(".modal").modal('hide')

      saveNewScript: (e) =>
        e.preventDefault()
        c = @xss_script_template uri: @$el.find("input#uri").val()
        j = CoffeeScript.compile(c)
        u = uglify(j)

        model = new ScriptModel()
        model.set 'name', @$el.find("input#name").val()
        model.set 'uri', @$el.find("input#uri").val()
        model.set 'compiled', u
        model.set 'source', c
        model.save null,
          success: =>
            @$el.find(".modal").one 'hidden', =>
              @collection.goTo(@collection.currentPage)
            @$el.find(".modal").modal('hide')
          error: =>
            @$el.find(".modal").find(".error").text("Error!").show()

      updateNewScript: (e) =>
        e.preventDefault()
        @$el.find("code#new-script-code").text(
          @xss_script_template uri: @$el.find("input#uri").val()
        )
        @$el.find('pre code').each (i, e) ->
          hljs.highlightBlock(e)

      refresh: (e) =>
        e.preventDefault()
        @collection.goTo(@collection.currentPage)

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
        @collection.goTo(1)

      previousPage: (e) =>
        e.preventDefault()
        if @collection.hasPreviousPage()
          @collection.requestPreviousPage()

      nextPage: (e) =>
        e.preventDefault()
        if @collection.hasNextPage()
          @collection.requestNextPage()
   
      render: =>
        @$el.empty()
        @$el.append @template
          items: @collection.toJSON()

        @$el.find(".next-page").parent().toggleClass "disabled", ! @collection.hasNextPage()
        @$el.find(".previous-page").parent().toggleClass "disabled", ! @collection.hasPreviousPage()

    class @HomeView extends Backbone.View
      tagName: 'div'
      className: 'home'
      initialize: =>
        @template = _.template $('#home-template').text()

      render: =>
        @$el.empty()
        @$el.append @template()

    class @MainApp extends Backbone.Router
      routes:
        "home"              :  "showHome"
        "scripts"           :  "showScripts"
        "scripts/new"       :  "newScript"
        "scripts/edit/:id"  :  "editScript"
        "reports/:uri"      :  "showReports"
        "*path"             :  "redirectDefault"

      initialize: =>
        @$el = $('.app')
        @$el.ajaxStart =>
          $.blockUI(message: null)
          $('#center').spin("large", "black")
        @$el.ajaxStop =>
          $('#center').spin(false)
          $.unblockUI()

        # fix Backbone's lack of trailing slash. 
        @$el.ajaxSend (e, jqxhr, settings) =>
          if not settings.url.endswith("/")
            settings.url += "/"

      showView: (@view) =>
        @$el.empty()
        @$el.append(@view.el)
        @hideMessage()
      
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

      showHome: =>
        view = new HomeView()
        view.render()
        @showView view

      redirectDefault: =>
        @navigate("home", trigger: true)

      showMessage: (msg, timeout) =>
        $('.global-flash').text(msg).show()

      hideMessage: =>
        $('.global-flash').hide()

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
    formatDate: (d) ->
      moment(d, 'YYYY-MM-DD HH:mm:ss').add({'hours' : 8}).format('YYYY-MM-DD HH:mm')

  Backbone.history.start({pushState: false})
