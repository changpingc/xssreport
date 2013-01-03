// Generated by CoffeeScript 1.3.3
(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  $(function() {
    String.prototype.endswith = function(s) {
      return this.length >= s.length && this.substr(this.length - s.length) === s;
    };
    window.XSSReport = (function() {
      this.PaginatedCollection = (function(_super) {

        __extends(PaginatedCollection, _super);

        function PaginatedCollection() {
          this.hasPreviousPage = __bind(this.hasPreviousPage, this);

          this.hasNextPage = __bind(this.hasNextPage, this);
          return PaginatedCollection.__super__.constructor.apply(this, arguments);
        }

        PaginatedCollection.prototype.parse = function(response) {
          this.response_meta = response.meta;
          return response.objects;
        };

        PaginatedCollection.prototype.hasNextPage = function() {
          if (this.response_meta) {
            return this.response_meta.next.length > 0;
          }
          return false;
        };

        PaginatedCollection.prototype.hasPreviousPage = function() {
          if (this.response_meta) {
            return this.response_meta.previous.length > 0;
          }
          return false;
        };

        PaginatedCollection.prototype.server_api = {
          'page': function() {
            return this.currentPage;
          }
        };

        PaginatedCollection.prototype.paginator_ui = {
          firstPage: 1,
          currentPage: 1,
          perPage: 20,
          totalPages: 10
        };

        return PaginatedCollection;

      })(Backbone.Paginator.requestPager);
      this.ScriptModel = (function(_super) {

        __extends(ScriptModel, _super);

        function ScriptModel() {
          return ScriptModel.__super__.constructor.apply(this, arguments);
        }

        ScriptModel.prototype.urlRoot = '/api/script/';

        ScriptModel.prototype.defaults = function() {
          return {
            name: "new name",
            uri: Math.random().toString(36).substr(2, 6),
            short_url: "",
            source: "\n",
            compiled: "\n"
          };
        };

        ScriptModel.prototype.save = function() {
          this.unset("created");
          this.unset("last_edited");
          return ScriptModel.__super__.save.apply(this, arguments);
        };

        return ScriptModel;

      })(Backbone.Model);
      this.ScriptCollection = (function(_super) {

        __extends(ScriptCollection, _super);

        function ScriptCollection() {
          return ScriptCollection.__super__.constructor.apply(this, arguments);
        }

        ScriptCollection.prototype.model = ScriptModel;

        ScriptCollection.prototype.paginator_core = {
          type: 'GET',
          dataType: 'json',
          url: '/api/script/'
        };

        return ScriptCollection;

      })(this.PaginatedCollection);
      this.ReportModel = (function(_super) {

        __extends(ReportModel, _super);

        function ReportModel() {
          return ReportModel.__super__.constructor.apply(this, arguments);
        }

        ReportModel.prototype.urlRoot = '/api/report/';

        ReportModel.prototype.save = function() {
          this.unset("created");
          return ReportModel.__super__.save.apply(this, arguments);
        };

        return ReportModel;

      })(Backbone.Model);
      this.ReportCollection = (function(_super) {

        __extends(ReportCollection, _super);

        function ReportCollection() {
          return ReportCollection.__super__.constructor.apply(this, arguments);
        }

        ReportCollection.prototype.model = ReportModel;

        ReportCollection.prototype.paginator_core = {
          type: 'GET',
          dataType: 'json',
          url: '/api/report/'
        };

        ReportCollection.prototype.server_api = {
          'page': function() {
            return this.currentPage;
          },
          'uri': function() {
            return this.uri;
          }
        };

        return ReportCollection;

      })(this.PaginatedCollection);
      this.ReportURICollection = (function(_super) {

        __extends(ReportURICollection, _super);

        function ReportURICollection() {
          return ReportURICollection.__super__.constructor.apply(this, arguments);
        }

        ReportURICollection.prototype.paginator_core = {
          type: 'GET',
          dataType: 'json',
          url: '/api/report/'
        };

        ReportURICollection.prototype.server_api = {
          'page': function() {
            return this.currentPage;
          },
          'method': 'listURI'
        };

        return ReportURICollection;

      })(this.PaginatedCollection);
      this.ScriptEditView = (function(_super) {

        __extends(ScriptEditView, _super);

        function ScriptEditView() {
          this.render = __bind(this.render, this);

          this.saveSourceToLocalStorage = __bind(this.saveSourceToLocalStorage, this);

          this.save = __bind(this.save, this);

          this.compress = __bind(this.compress, this);

          this.run = __bind(this.run, this);

          this.compile = __bind(this.compile, this);

          this.shortenGoogle = __bind(this.shortenGoogle, this);

          this.createShortURL = __bind(this.createShortURL, this);

          this.constructLongURL = __bind(this.constructLongURL, this);

          this.initialize = __bind(this.initialize, this);
          return ScriptEditView.__super__.constructor.apply(this, arguments);
        }

        ScriptEditView.prototype.tagName = 'div';

        ScriptEditView.prototype.className = 'script-edit-view';

        ScriptEditView.prototype.initialize = function() {
          this.template = _.template($('#script-edit-template').text());
          this.model.on("change", this.render);
          return this.throttledSaveSource = _.throttle(this.saveSourceToLocalStorage, 2000);
        };

        ScriptEditView.prototype.events = {
          "click a.compile": "compile",
          "click a.compress": "compress",
          "click a.run": "run",
          "click a.save": "save",
          "click a.shorten-google": "shortenGoogle"
        };

        ScriptEditView.prototype.constructLongURL = function() {
          return "http://xssreport.herokuapp.com/x/" + this.model.get('uri') + '/';
        };

        ScriptEditView.prototype.createShortURL = function(service) {
          var _this = this;
          return window.XSSReport.app.shorten(this.constructLongURL(), service, function(result) {
            if (result !== "error") {
              return _this.$el.find("input#short-url").val(result);
            }
          });
        };

        ScriptEditView.prototype.shortenGoogle = function(e) {
          e.preventDefault();
          return this.createShortURL("google");
        };

        ScriptEditView.prototype.compile = function(e) {
          var compiled;
          e.preventDefault();
          try {
            compiled = CoffeeScript.compile(this.editor.getValue());
            return this.compiled_view.setValue(compiled);
          } catch (error) {
            return this.$el.find('#error').text(error.message).show();
          }
        };

        ScriptEditView.prototype.run = function(e) {
          e.preventDefault();
          try {
            eval(this.compiled_view.getValue());
            return this.$el.find('#error').hide();
          } catch (e) {
            return this.$el.find('#error').text(error.message).show();
          }
        };

        ScriptEditView.prototype.compress = function(e) {
          e.preventDefault();
          return this.compiled_view.setValue(uglify(this.compiled_view.getValue()));
        };

        ScriptEditView.prototype.save = function(e) {
          var _this = this;
          e.preventDefault();
          this.model.set("source", this.editor.getValue());
          this.model.set("compiled", this.compiled_view.getValue());
          this.model.set("name", this.$el.find("input#name").val());
          this.model.set("uri", this.$el.find("input#uri").val());
          this.model.set("short_url", this.$el.find("input#short-url").val());
          return this.model.save(null, {
            success: function(data, textStatus, jqXHR) {
              XSSReport.app.show("Saved.", "success");
              return XSSReport.app.navigate("scripts/edit/" + _this.model.get("id"));
            }
          });
        };

        ScriptEditView.prototype.saveSourceToLocalStorage = function() {
          var content;
          content = this.editor.getValue();
          return localStorage["lastSourceContent"] = content;
        };

        ScriptEditView.prototype.render = function() {
          var _this = this;
          this.$el.empty();
          this.$el.append(this.template(this.model.toJSON()));
          this.editor = CodeMirror.fromTextArea(this.$el.find('.code-editor')[0], {
            onKeyEvent: function(editor, e) {
              _this.throttledSaveSource();
            },
            lineNumbers: true,
            mode: "coffeescript"
          });
          if (this.editor.getValue().length === 0) {
            this.editor.setValue("\n");
          }
          this.compiled_view = CodeMirror.fromTextArea(this.$el.find('.compiled')[0], {
            lineNumbers: true,
            mode: "javascript",
            readOnly: true,
            lineWrapping: true
          });
          if (this.compiled_view.getValue().length === 0) {
            this.compiled_view.setValue("\n");
          }
          this.$el.find(".CodeMirror-scroll").hover(function() {
            return $(this).get(0).style.cursor = "text";
          });
          return _.defer(function() {
            _this.editor.setValue(_this.model.get("source"));
            return _this.compiled_view.setValue(_this.model.get("compiled"));
          });
        };

        return ScriptEditView;

      })(Backbone.View);
      this.ScriptsListView = (function(_super) {

        __extends(ScriptsListView, _super);

        function ScriptsListView() {
          this.render = __bind(this.render, this);

          this.goBack = __bind(this.goBack, this);

          this.refresh = __bind(this.refresh, this);

          this.updateNewScript = __bind(this.updateNewScript, this);

          this.saveNewScript = __bind(this.saveNewScript, this);

          this.createCustomScript = __bind(this.createCustomScript, this);

          this.createNewScript = __bind(this.createNewScript, this);

          this.nextPage = __bind(this.nextPage, this);

          this.previousPage = __bind(this.previousPage, this);

          this.showReports = __bind(this.showReports, this);

          this.duplicateScript = __bind(this.duplicateScript, this);

          this.removeScript = __bind(this.removeScript, this);

          this.useScript = __bind(this.useScript, this);

          this.editScript = __bind(this.editScript, this);

          this.initialize = __bind(this.initialize, this);
          return ScriptsListView.__super__.constructor.apply(this, arguments);
        }

        ScriptsListView.prototype.tagName = 'div';

        ScriptsListView.prototype.className = 'scripts-list-view';

        ScriptsListView.prototype.events = {
          "click a.edit-script": "editScript",
          "click a.use-script": "useScript",
          "click a.remove-script": "removeScript",
          "click a.duplicate-script": "duplicateScript",
          "click a.show-reports": "showReports",
          "click a.previous-page": "previousPage",
          "click a.next-page": "nextPage",
          "click a.add-script": "createNewScript",
          "click .refresh": "refresh",
          "click .save-new-script": "saveNewScript",
          "click .create-custom-script": "createCustomScript",
          "click a.go-back": "goBack"
        };

        ScriptsListView.prototype.initialize = function() {
          this.template = _.template($('#scripts-list-template').text());
          this.usage_template = _.template($('#script-usage-template').text());
          this.new_script_template = _.template($('#new-script-template').text());
          this.xss_script_template = _.template($('#xss-general-template').text());
          this.collection.on('reset', this.render);
          return this.collection.goTo(1);
        };

        ScriptsListView.prototype.editScript = function(e) {
          var model, model_id, view;
          e.preventDefault();
          model_id = parseInt($(event.target).parents("tr").data("id"));
          model = this.collection.get(model_id);
          view = new ScriptEditView({
            model: model
          });
          view.render();
          window.XSSReport.app.navigate("scripts/edit/" + model_id);
          return window.XSSReport.app.showView(view);
        };

        ScriptsListView.prototype.useScript = function(e) {
          var modal, model, model_id;
          e.preventDefault();
          model_id = parseInt($(event.target).parents("tr").data("id"));
          model = this.collection.get(model_id);
          modal = this.$el.find(".modal");
          modal.empty();
          modal.append(this.usage_template(model.toJSON()));
          modal.find('pre code').each(function(i, e) {
            return hljs.highlightBlock(e);
          });
          return modal.modal();
        };

        ScriptsListView.prototype.removeScript = function(e) {
          var model, model_id,
            _this = this;
          e.preventDefault();
          model_id = parseInt($(event.target).parents("tr").data("id"));
          model = this.collection.get(model_id);
          if (model && confirm('Are you sure to delete "' + model.get('uri') + '"?')) {
            return model.destroy({
              success: function() {
                return _this.collection.goTo(_this.collection.currentPage);
              }
            });
          }
        };

        ScriptsListView.prototype.duplicateScript = function(e) {
          var model, model_id, new_model;
          e.preventDefault();
          model_id = parseInt($(event.target).parents("tr").data("id"));
          model = this.collection.get(model_id);
          new_model = new ScriptModel(_.omit(model.toJSON(), "id", "created", "last_edited"));
          window.XSSReport.app.navigate("scripts/new");
          return window.XSSReport.app.newScript(new_model);
        };

        ScriptsListView.prototype.showReports = function(e) {
          var model, model_id;
          e.preventDefault();
          model_id = parseInt($(event.target).parents("tr").data("id"));
          model = this.collection.get(model_id);
          return window.XSSReport.app.navigate("reports/" + model.get("uri"), {
            trigger: true
          });
        };

        ScriptsListView.prototype.previousPage = function(e) {
          e.preventDefault();
          if (this.collection.hasPreviousPage()) {
            return this.collection.requestPreviousPage();
          }
        };

        ScriptsListView.prototype.nextPage = function(e) {
          e.preventDefault();
          if (this.collection.hasNextPage()) {
            return this.collection.requestNextPage();
          }
        };

        ScriptsListView.prototype.createNewScript = function(e) {
          var modal;
          e.preventDefault();
          modal = this.$el.find(".modal");
          modal.empty();
          modal.append(this.new_script_template());
          modal.find('pre code').each(function(i, e) {
            return hljs.highlightBlock(e);
          });
          modal.modal();
          return modal.find('input#uri').bind('input', this.updateNewScript);
        };

        ScriptsListView.prototype.createCustomScript = function(e) {
          var _this = this;
          e.preventDefault();
          this.$el.find(".modal").one('hidden', function() {
            return window.XSSReport.app.navigate("scripts/new", {
              trigger: true
            });
          });
          return this.$el.find(".modal").modal('hide');
        };

        ScriptsListView.prototype.saveNewScript = function(e) {
          var c, j, model, u,
            _this = this;
          e.preventDefault();
          c = this.xss_script_template({
            uri: this.$el.find("input#uri").val()
          });
          j = CoffeeScript.compile(c);
          u = uglify(j);
          model = new ScriptModel();
          model.set('name', this.$el.find("input#name").val());
          model.set('uri', this.$el.find("input#uri").val());
          model.set('compiled', u);
          model.set('source', c);
          return model.save(null, {
            success: function() {
              _this.$el.find(".modal").one('hidden', function() {
                return _this.collection.goTo(_this.collection.currentPage);
              });
              return _this.$el.find(".modal").modal('hide');
            },
            error: function() {
              return _this.$el.find(".modal").find(".error").text("Error!").show();
            }
          });
        };

        ScriptsListView.prototype.updateNewScript = function(e) {
          e.preventDefault();
          this.$el.find("code#new-script-code").text(this.xss_script_template({
            uri: this.$el.find("input#uri").val()
          }));
          return this.$el.find('pre code').each(function(i, e) {
            return hljs.highlightBlock(e);
          });
        };

        ScriptsListView.prototype.refresh = function(e) {
          e.preventDefault();
          return this.collection.goTo(this.collection.currentPage);
        };

        ScriptsListView.prototype.goBack = function(e) {
          e.preventDefault();
          return window.history.back();
        };

        ScriptsListView.prototype.render = function() {
          this.$el.empty();
          this.$el.append(this.template({
            items: this.collection.toJSON()
          }));
          this.$el.find(".next-page").parent().toggleClass("disabled", !this.collection.hasNextPage());
          return this.$el.find(".previous-page").parent().toggleClass("disabled", !this.collection.hasPreviousPage());
        };

        return ScriptsListView;

      })(Backbone.View);
      this.ReportsListView = (function(_super) {

        __extends(ReportsListView, _super);

        function ReportsListView() {
          this.render = __bind(this.render, this);

          this.refresh = __bind(this.refresh, this);

          this.goBack = __bind(this.goBack, this);

          this.filterReports = __bind(this.filterReports, this);

          this.nextPage = __bind(this.nextPage, this);

          this.previousPage = __bind(this.previousPage, this);

          this.initialize = __bind(this.initialize, this);
          return ReportsListView.__super__.constructor.apply(this, arguments);
        }

        ReportsListView.prototype.events = {
          "click a.previous-page": "previousPage",
          "click a.next-page": "nextPage",
          "click a.go-back": "goBack",
          "click .filter-reports": "filterReports",
          "click .refresh": "refresh"
        };

        ReportsListView.prototype.initialize = function() {
          this.template = _.template($('#reports-list-template').text());
          this.collection.on("reset", this.render);
          return this.collection.goTo(1);
        };

        ReportsListView.prototype.previousPage = function(e) {
          e.preventDefault();
          if (this.collection.hasPreviousPage()) {
            return this.collection.requestPreviousPage();
          }
        };

        ReportsListView.prototype.nextPage = function(e) {
          e.preventDefault();
          if (this.collection.hasNextPage()) {
            return this.collection.requestNextPage();
          }
        };

        ReportsListView.prototype.filterReports = function(e) {
          var args, f, filter, _i, _len, _ref;
          e.preventDefault();
          filter = this.$el.find("input#filter").val();
          try {
            _ref = filter.split("&");
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              f = _ref[_i];
              args = f.split("=");
              this.collection.server_api[args[0]] = args[1];
            }
          } catch (e) {
            return XSSReport.app.show('Cannot parse filter "' + filter + '"', "error");
          }
          XSSReport.app.show("Parameters: " + JSON.stringify(_.omit(this.collection.server_api, "page")), "info");
          return this.collection.goTo(1);
        };

        ReportsListView.prototype.goBack = function(e) {
          e.preventDefault();
          return window.history.back();
        };

        ReportsListView.prototype.refresh = function(e) {
          e.preventDefault();
          return this.collection.goTo(this.collection.currentPage);
        };

        ReportsListView.prototype.render = function() {
          var filterTmp;
          filterTmp = this.$el.find("input#filter").val() || "";
          this.$el.empty();
          this.$el.append(this.template({
            items: this.collection.toJSON()
          }));
          this.$el.find("input#filter").val(filterTmp);
          this.$el.find(".next-page").parent().toggleClass("disabled", !this.collection.hasNextPage());
          return this.$el.find(".previous-page").parent().toggleClass("disabled", !this.collection.hasPreviousPage());
        };

        return ReportsListView;

      })(Backbone.View);
      this.HomeView = (function(_super) {

        __extends(HomeView, _super);

        function HomeView() {
          this.render = __bind(this.render, this);

          this.refresh = __bind(this.refresh, this);

          this.nextPage = __bind(this.nextPage, this);

          this.previousPage = __bind(this.previousPage, this);

          this.goReports = __bind(this.goReports, this);

          this.showScripts = __bind(this.showScripts, this);

          this.showReports = __bind(this.showReports, this);

          this.initialize = __bind(this.initialize, this);
          return HomeView.__super__.constructor.apply(this, arguments);
        }

        HomeView.prototype.tagName = 'div';

        HomeView.prototype.className = 'home';

        HomeView.prototype.initialize = function() {
          var _this = this;
          this.template = _.template($('#home-template').text());
          this.collection = new ReportURICollection();
          this.ajaxOptions = {
            global: false,
            beforeSend: function() {
              return _this.$el.find(".spin-area").spin("large", "black");
            },
            complete: function() {
              return _this.$el.find(".spin-area").spin(false);
            }
          };
          this.collection.on("reset", this.render);
          return _.delay(function() {
            return _this.collection.goTo(1, _this.ajaxOptions);
          }, 100);
        };

        HomeView.prototype.events = {
          "click a.show-reports": "showReports",
          "click a.show-scripts": "showScripts",
          "click .go-reports": "goReports",
          "click a.previous-page": "previousPage",
          "click a.next-page": "nextPage",
          "click .refresh": "refresh"
        };

        HomeView.prototype.showReports = function(e) {
          var uri;
          e.preventDefault();
          uri = $(event.target).parents("tr").data("uri");
          return XSSReport.app.navigate("reports/" + uri, {
            trigger: true
          });
        };

        HomeView.prototype.showScripts = function(e) {
          e.preventDefault();
          return XSSReport.app.navigate("scripts", {
            trigger: true
          });
        };

        HomeView.prototype.goReports = function(e) {
          var uri;
          e.preventDefault();
          uri = $.trim(this.$el.find("input#uri").val());
          return XSSReport.app.navigate("reports/" + uri, {
            trigger: true
          });
        };

        HomeView.prototype.previousPage = function(e) {
          e.preventDefault();
          if (this.collection.hasPreviousPage()) {
            return this.collection.requestPreviousPage(this.ajaxOptions);
          }
        };

        HomeView.prototype.nextPage = function(e) {
          e.preventDefault();
          if (this.collection.hasNextPage()) {
            return this.collection.requestNextPage(this.ajaxOptions);
          }
        };

        HomeView.prototype.refresh = function(e) {
          e.preventDefault();
          return this.collection.goTo(this.collection.currentPage, this.ajaxOptions);
        };

        HomeView.prototype.render = function() {
          this.$el.empty();
          this.$el.append(this.template({
            items: this.collection.toJSON()
          }));
          this.$el.find(".next-page").parent().toggleClass("disabled", !this.collection.hasNextPage());
          return this.$el.find(".previous-page").parent().toggleClass("disabled", !this.collection.hasPreviousPage());
        };

        return HomeView;

      })(Backbone.View);
      this.MainApp = (function(_super) {

        __extends(MainApp, _super);

        function MainApp() {
          this.shorten = __bind(this.shorten, this);

          this.hide = __bind(this.hide, this);

          this.show = __bind(this.show, this);

          this.redirectDefault = __bind(this.redirectDefault, this);

          this.showHome = __bind(this.showHome, this);

          this.showReportsForURI = __bind(this.showReportsForURI, this);

          this.editScript = __bind(this.editScript, this);

          this.newScript = __bind(this.newScript, this);

          this.showScripts = __bind(this.showScripts, this);

          this.showView = __bind(this.showView, this);

          this.initialize = __bind(this.initialize, this);
          return MainApp.__super__.constructor.apply(this, arguments);
        }

        MainApp.prototype.routes = {
          "home": "showHome",
          "scripts": "showScripts",
          "scripts/new": "newScript",
          "scripts/edit/:id": "editScript",
          "reports/:uri": "showReportsForURI",
          "*path": "redirectDefault"
        };

        MainApp.prototype.initialize = function() {
          var _this = this;
          this.$el = $('.app');
          this.$el.ajaxStart(function() {
            $.blockUI({
              message: null
            });
            return $('#center').spin("large", "black");
          });
          this.$el.ajaxStop(function() {
            $('#center').spin(false);
            return $.unblockUI();
          });
          this.$el.ajaxError(function() {
            return _this.show("ajax error!", "error");
          });
          return this.$el.ajaxSend(function(e, jqxhr, settings) {
            if (!settings.url.endswith("/") && settings.method !== "GET") {
              return settings.url += "/";
            }
          });
        };

        MainApp.prototype.showView = function(view) {
          this.view = view;
          this.$el.empty();
          this.$el.append(this.view.el);
          return this.hide();
        };

        MainApp.prototype.showScripts = function() {
          var collection, view;
          collection = new ScriptCollection();
          view = new ScriptsListView({
            collection: collection
          });
          view.render();
          return this.showView(view);
        };

        MainApp.prototype.newScript = function(_model) {
          var model, view;
          model = _model || new ScriptModel();
          view = new ScriptEditView({
            model: model
          });
          view.render();
          return this.showView(view);
        };

        MainApp.prototype.editScript = function(id) {
          var model, view;
          model = new ScriptModel({
            id: parseInt(id)
          });
          view = new ScriptEditView({
            model: model
          });
          model.fetch();
          return this.showView(view);
        };

        MainApp.prototype.showReportsForURI = function(uri) {
          var collection, view;
          collection = new ReportCollection();
          collection.uri = uri;
          view = new ReportsListView({
            collection: collection
          });
          view.render();
          return this.showView(view);
        };

        MainApp.prototype.showHome = function() {
          var view;
          view = new HomeView();
          view.render();
          return this.showView(view);
        };

        MainApp.prototype.redirectDefault = function() {
          return this.navigate("home", {
            trigger: true
          });
        };

        MainApp.prototype.show = function(msg, type) {
          if (!type) {
            type = "success";
          }
          $('.alert-text').text(msg);
          return $('.global-flash').addClass("alert-" + type).show();
        };

        MainApp.prototype.hide = function() {
          return $('.global-flash').hide();
        };

        MainApp.prototype.shorten = function(long, service, callback) {
          var _this = this;
          this.callback = callback;
          if (service === "google") {
            return $.ajax({
              url: "https://www.googleapis.com/urlshortener/v1/url",
              data: JSON.stringify({
                longUrl: long
              }),
              type: "POST",
              dataType: "json",
              contentType: 'application/json',
              success: function(data, textStatus, jqXHR) {
                return _this.callback(data.id);
              },
              error: function() {
                return _this.callback("error");
              }
            });
          }
        };

        return MainApp;

      })(Backbone.Router);
      return {
        app: new this.MainApp(),
        formatDate: function(d) {
          return moment(d, 'YYYY-MM-DD HH:mm:ss').add({
            'hours': 8
          }).format('YYYY-MM-DD HH:mm');
        }
      };
    })();
    return Backbone.history.start({
      pushState: false
    });
  });

}).call(this);
