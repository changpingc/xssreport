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

        PaginatedCollection.prototype.currentPage = 0;

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

        ScriptCollection.prototype.paginator_ui = {
          firstPage: 0,
          currentPage: 0,
          perPage: 20,
          totalPages: 10
        };

        ScriptCollection.prototype.server_api = {
          'page': function() {
            return this.currentPage;
          }
        };

        return ScriptCollection;

      })(this.PaginatedCollection);
      this.ReportModel = (function(_super) {

        __extends(ReportModel, _super);

        function ReportModel() {
          return ReportModel.__super__.constructor.apply(this, arguments);
        }

        ReportModel.prototype.urlRoot = '/api/report/';

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

        ReportCollection.prototype.paginator_ui = {
          firstPage: 0,
          currentPage: 0,
          perPage: 100,
          totalPages: 10
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
          this.model.set("name", this.$el.find("input#name").val());
          this.model.set("uri", this.$el.find("input#uri").val());
          this.model.set("short_url", this.$el.find("input#short-url").val());
          this.model.set("source", this.editor.getValue());
          this.model.set("compiled", this.compiled_view.getValue());
          return this.model.save(null, {
            error: function(jqXHR, textStatus, errorThrown) {
              console.log(textStatus);
              console.log(errorThrown);
              return _this.$el.find('#error').text(errorThrown).show();
            },
            success: function(data, textStatus, jqXHR) {
              window.XSSReport.app.showMessage("Saved.");
              return _this.model.fetch(null, {
                error: function(jqXHR, textStatus, errorThrown) {
                  console.log(textStatus);
                  console.log(errorThrown);
                  return _this.$el.find('#error').text(errorThrown).show();
                },
                success: function(data, textStatus, jqXHR) {
                  return _this.$el.find('#error').hide();
                }
              });
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
            readOnly: true
          });
          if (this.compiled_view.getValue().length === 0) {
            this.compiled_view.setValue("\n");
          }
          this.$el.find(".CodeMirror-scroll").hover(function() {
            return $(this).get(0).style.cursor = "text";
          });
          return _.delay(function() {
            _this.editor.setValue(_this.model.get("source"));
            return _this.compiled_view.setValue(_this.model.get("compiled"));
          }, 200);
        };

        return ScriptEditView;

      })(Backbone.View);
      this.ScriptsListView = (function(_super) {

        __extends(ScriptsListView, _super);

        function ScriptsListView() {
          this.render = __bind(this.render, this);

          this.refresh = __bind(this.refresh, this);

          this.createNewScript = __bind(this.createNewScript, this);

          this.nextPage = __bind(this.nextPage, this);

          this.previousPage = __bind(this.previousPage, this);

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
          "click a.previous-page": "previousPage",
          "click a.next-page": "nextPage",
          "click a.add-script": "createNewScript",
          "click a.refresh": "refresh"
        };

        ScriptsListView.prototype.initialize = function() {
          this.template = _.template($('#scripts-list-template').text());
          this.usage_template = _.template($('#script-usage-template').text());
          this.collection.on('reset', this.render);
          return this.collection.goTo(0);
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
                return _this.collection.fetch();
              }
            });
          }
        };

        ScriptsListView.prototype.duplicateScript = function(e) {
          var model, model_id, new_model;
          e.preventDefault();
          model_id = parseInt($(event.target).parents("tr").data("id"));
          model = this.collection.get(model_id);
          new_model = new ScriptModel(_.omit(model.toJSON(), "id"));
          window.XSSReport.app.navigate("scripts/new");
          return window.XSSReport.app.newScript(new_model);
        };

        ScriptsListView.prototype.previousPage = function(e) {
          e.preventDefault();
          if (this.collection.hasPreviousPage()) {
            return this.collection.requestPrevious();
          }
        };

        ScriptsListView.prototype.nextPage = function(e) {
          e.preventDefault();
          if (this.collection.hasPreviousPage()) {
            return this.collection.requestNext();
          }
        };

        ScriptsListView.prototype.createNewScript = function(e) {
          e.preventDefault();
          return window.XSSReport.app.navigate("scripts/new", {
            trigger: true
          });
        };

        ScriptsListView.prototype.refresh = function(e) {
          e.preventDefault();
          return this.collection.fetch();
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

          this.nextPage = __bind(this.nextPage, this);

          this.previousPage = __bind(this.previousPage, this);

          this.initialize = __bind(this.initialize, this);
          return ReportsListView.__super__.constructor.apply(this, arguments);
        }

        ReportsListView.prototype.events = {
          "click a.previous-page": "previousPage",
          "click a.next-page": "nextPage"
        };

        ReportsListView.prototype.initialize = function() {
          this.template = _.template($('#reports-list-template').text());
          this.collection.on("reset", this.render);
          return this.collection.fetch();
        };

        ReportsListView.prototype.previousPage = function(e) {
          e.preventDefault();
          if (this.collection.hasPreviousPage()) {
            return this.collection.requestPrevious();
          }
        };

        ReportsListView.prototype.nextPage = function(e) {
          e.preventDefault();
          if (this.collection.hasPreviousPage()) {
            return this.collection.requestNext();
          }
        };

        ReportsListView.prototype.render = function() {
          this.$el.empty();
          return this.$el.append(this.template({
            items: this.collection.toJSON()
          }));
        };

        return ReportsListView;

      })(Backbone.View);
      this.MainApp = (function(_super) {

        __extends(MainApp, _super);

        function MainApp() {
          this.shorten = __bind(this.shorten, this);

          this.showMessage = __bind(this.showMessage, this);

          this.redirectDefault = __bind(this.redirectDefault, this);

          this.showReports = __bind(this.showReports, this);

          this.editScript = __bind(this.editScript, this);

          this.newScript = __bind(this.newScript, this);

          this.showScripts = __bind(this.showScripts, this);

          this.showView = __bind(this.showView, this);

          this.initialize = __bind(this.initialize, this);
          return MainApp.__super__.constructor.apply(this, arguments);
        }

        MainApp.prototype.routes = {
          "scripts": "showScripts",
          "scripts/new": "newScript",
          "scripts/edit/:id": "editScript",
          "reports/:uri": "showReports",
          "": "redirectDefault"
        };

        MainApp.prototype.initialize = function() {
          var _this = this;
          this.$el = $('.app');
          this.$el.ajaxStart(function() {
            return _this.$el.spin("large", "white");
          });
          this.$el.ajaxStop(function() {
            return _this.$el.spin(false);
          });
          return this.$el.ajaxSend(function(e, jqxhr, settings) {
            if (!settings.url.endswith("/")) {
              return settings.url += "/";
            }
          });
        };

        MainApp.prototype.showView = function(view) {
          this.view = view;
          this.$el.empty();
          return this.$el.append(this.view.el);
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

        MainApp.prototype.showReports = function(uri) {
          var collection, view;
          collection = new ReportCollection();
          collection.uri = uri;
          view = new ReportsListView({
            collection: collection
          });
          view.render();
          return this.showView(view);
        };

        MainApp.prototype.redirectDefault = function() {
          return this.navigate("scripts", {
            trigger: true
          });
        };

        MainApp.prototype.showMessage = function(msg, timeout) {
          return $('.global-flash').text(msg).show();
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
        app: new this.MainApp()
      };
    })();
    return Backbone.history.start({
      pushState: false
    });
  });

}).call(this);