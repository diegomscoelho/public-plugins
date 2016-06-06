/*
 * Copyright [1999-2016] Wellcome Trust Sanger Institute and the EMBL-European Bioinformatics Institute
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *      http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

Ensembl.LayoutManager.extend({
  makeZMenu: function (id, params) {

    if (window.location.href.match(/Transcript\/ProteinSummary/) && !params.area.a.attrs.href && params.area.a.attrs.title && params.imageId) { // restricting to ProteinSummary only atm

      if (!this.nonAjaxZmenuGAEvent) {
        this.nonAjaxZmenuGAEvent = new Ensembl.GA.EventConfig({ category: 'ZMenuOpen' });
      }

      var action  = params.area.a.attrs.title.split(/;/)[0].split(/:/)[0];
      var label   = action ? $('#' + params.imageId).find('input.image_config').val() : '';

      if (action && label) {
        Ensembl.GA.sendEvent(this.nonAjaxZmenuGAEvent, { action: action, label: label });
      }
    }

    return this.base(id, params);
  }
});

Ensembl.Panel.ImageMap = Ensembl.Panel.ImageMap.extend({
  initHoverLabels: function () {
    this.base.apply(this, arguments);

    Ensembl.GA.registerConfigs([

      // Changing track renderer, adding/removing track from favourite tracks and removing a track from hover labels
      {
        selector  : this.elLk.hoverLabels.find('a.config'),
        event     : 'click',
        data      : {
                      id    : this.id,
                      type  : function () {
                                return this.currentTarget.className.match(/closetrack|favourite/)
                                  ? this.currentTarget.className.match(/closetrack/)
                                  ? 'off'
                                  : 'favourite'
                                  : this.currentTarget.parentNode.className.replace(/\s*current\s*/, ''); // renderer
                              }
                    },
        category  : function () { return this.data.type !== 'favourite' ? this.currentTarget.className.match(/closetrack/) ? 'Image-TrackOff' : 'Image-TrackStyle' : 'Image-TrackFav'; },
        action    : function () { var trackName = this.currentTarget.href.match(new RegExp("([^\;\&]+)\=" + this.data.type)); return trackName ? this.data.id + '-' + trackName[1] : false; },
        label     : function () { return this.data.type === 'favourite' ? this.currentTarget.className.match(/selected/) ? 'On' : 'Off' : this.data.type; }
      },

      // Description links on image hover labels
      {
        wrapper   : this.elLk.hoverLabels.find('div._hl_tab:not(.config)'),
        selector  : 'a:not(.config)',
        event     : 'click',
        category  : 'Image-TrackDescLink',
        data      : { id: this.id },
        action    : function () { return this.data.id + '-' + $(this.currentTarget).closest('.hover_label').attr('class').replace(/hover_label|floating_popup/g, '').replace(/(^|\s+)[a-z0-9]{8}(\s+|$)/i, ''); },
        label     : function () { return this.getURL(); }
      }
    ]);
  },

  navClick: function(area, e) {
    if (!this.navClickEventConfig) {
      this.navClickEventConfig = new Ensembl.GA.EventConfig({
        category        : 'ComparisonNavClick',
        action          : function () { return this.areaAttrs.alt; },
        label           : function () {
                            var id = parseInt((this.areaAttrs.href.match(/;id=([0-9]+)/) || []).pop() || 0);
                            return id ? 'Secondary species - ' + id : 'Primary species';
                          },
        nonInteraction  : true
      });
    }

    Ensembl.GA.sendEvent(this.navClickEventConfig, {areaAttrs: area.a.attrs}, e);
    this.base(area, e);
  }
});

Ensembl.Panel.ModalContainer = Ensembl.Panel.ModalContainer.extend({
  init: function () {
    this.base.apply(this, arguments);

    Ensembl.GA.registerConfigs([

      // Modal tabs
      {
        selector  : this.elLk.tabs.children('a'),
        event     : 'click',
        category  : 'Modal-TabLink',
        data      : { url : function () { return this.getURL(); } },
        action    : function () { return this.data.url.match(/\/Config\//) ? this.data.url.replace(/\/[^\/]+$/, '') : this.data.url; },
        label     : function () { return this.data.url.match(/\/Config\//) ? this.data.url.split('/').pop() : ''; }
      }
    ]);
  }
});

Ensembl.Panel.Exporter = Ensembl.Panel.Exporter.extend({
  init: function () {
    var panel = this;
    this.base.apply(this, arguments);

    Ensembl.GA.registerConfigs([

      // Which formats are users exporting? 
      {
        selector  : this.el.find('#export_configuration'),
        event     : 'submit',
        category  : 'Exporter',
        action    : 'Export/Configure',
        label     : function () { return $(this.currentTarget).find('select[name=output]').val(); }
      }
    ]);
  }
});


Ensembl.Panel.ModalContent = Ensembl.Panel.ModalContent.extend({
  init: function () {
    var panel = this;
    this.base.apply(this, arguments);

    Ensembl.GA.registerConfigs([

      // Modal Local context
      {
        selector  : this.elLk.links.add(this.elLk.links.children('a')), // click on <a> returns false in ModalContent so it won't log it twice since we check for originalEvent too
        event     : 'click',
        data      : { link : function () { return $(this.currentTarget.childNodes).add(this.currentTarget).filter('a'); } },
        category  : function (e) { return e.originalEvent ? 'Modal-LocalContext' : false; }, // returning false cancels the event logging
        action    : function () { return this.getURL(this.data.link[0]); },
        label     : function () { return this.data.link.html(); }
      },
    ]);

    // Only when the form submit action is Text Alignments (exluding preview button actions in Text Alignmetns)
    if (!this.textAlignmentEvent) {
      this.textAlignmentEvent = {
        format       : new Ensembl.GA.EventConfig({ category: 'TextAlignment-DownloadFormat', nonInteraction: true }),
        compression : new Ensembl.GA.EventConfig({ category: 'TextAlignment-Compression', nonInteraction: true })
      };
    }
  },

  formSubmit: function(form, data) {
    var panel = this;
    this.base(form, data);

    if ($(form).attr('action').match(/DataExport\/Output/)) {
      var formData = form.serializeArray();
      var formDataHash = {};
      formData.forEach(function(obj) {
        formDataHash[obj.name] = obj.value;
      });

      if (formDataHash.export_action && formDataHash.export_action == 'TextAlignments' && formDataHash.compression !== 'preview') {
        Ensembl.GA.sendEvent(this.textAlignmentEvent.format, { action: formDataHash.component, label: formDataHash.format });
        Ensembl.GA.sendEvent(this.textAlignmentEvent.compression, { action: formDataHash.component, label: formDataHash.compression  });
      }
    }
    // Return false to stop multiple form submit
    return false;
  },

  updateContent: function(json) {
    var panel = this;
    this.base(json);

    Ensembl.GA.registerConfigs([
      // Download button click (uncompressed) after preview
      {
        selector  : this.el.find('#DataExport_Results .export_buttons_div input[name="uncompressed"]'),
        event     : 'click',
        category  : this.textAlignmentEvent.format,
        data      : { format: panel.getParam('format', panel.el.find('input[name="uncompressed"]:hidden').val()) },
        action    : function () { return 'Compara_Alignments' },
        label     : function () { return(this.data.format); }
      },
      {
        selector  : this.el.find('#DataExport_Results .export_buttons_div input[name="uncompressed"]'),
        event     : 'click',
        category  : this.textAlignmentEvent.format,
        data      : { compression: panel.getParam('compression', panel.el.find('input[name="uncompressed"]:hidden').val()) },
        action    : function () { return 'Compara_Alignments' },
        label     : function () { return(this.data.compression || 'uncompressed'); }
      }
    ]);
  },

  getParam: function(field, url='') {
    url = url.replace(/;/g, '&');
    var reg = new RegExp( '[?&]' + field + '=([^&#]*)', 'i' );
    var string = reg.exec(url);
    return string ? string[1] : null;
  }
});

Ensembl.Panel.Configurator = Ensembl.Panel.Configurator.extend({
  init: function () {
    this.base.apply(this, arguments);

    Ensembl.GA.registerConfigs([

      // LocalContext
      {
        selector  : this.elLk.links.add(this.elLk.links.children('a')), // click on <a> returns false in ModalContent so it won't log it twice since we check for originalEvent too
        event     : 'click',
        data      : { component : this.component, link : function () { return $(this.currentTarget.childNodes).add(this.currentTarget).filter('a'); } },
        category  : function (e) { return e.originalEvent ? 'Config-LocalContext' : false; }, // returning false cancels the event logging
        action    : function () { return this.data.component + '-' + this.data.link.attr('class'); },
        label     : function () { return this.data.link.html(); }
      },

      // LHS buttons
      {
        selector  : this.el.find('.tool_buttons p a'),
        event     : 'click',
        category  : 'Config-LeftButton',
        data      : { component: this.component },
        action    : function () {
                      var match = this.currentTarget.href.match(/reset\=([^;&]+)/);
                      return match ? match[1] === 'track_order' ? '/Ajax/order_reset' : '/Ajax/config_reset' : this.getURL(); // keeping action same as ImageToolbar
                    },
        label     : function () { return this.data.component; }
      },

      // Header links on 'Active tracks', 'Favourite tracks' etc
      {
        selector  : '.config_header',
        wrapper   : this.elLk.configDivs.not('.view_config'),
        event     : 'click',
        data      : { component: this.component },
        category  : 'Config-HeaderLink',
        action    : function () { return this.data.component + '-' + this.currentTarget.parentNode.className.replace(/\s*config\s*/, ''); },
        label     : function () { return this.currentTarget.innerHTML; }
      },

      // All elements in the view config form
      {
        selector  : this.elLk.viewConfigInputs,
        event     : 'change',
        data      : { component: this.component },
        category  : 'Config-ViewConfig',
        action    : function () { return this.data.component + '-' + this.currentTarget.name; },
        label     : function () { return this.currentTarget.type === 'checkbox' ? this.currentTarget.checked ? 'true' : 'false' : this.currentTarget.value; }
      },

      // 'Find a track' input box
      {
        selector  : this.elLk.search,
        event     : 'blur', // log the event when search is finished and user has clicked somewhere else
        data      : { component: this.component },
        category  : 'Config-Search',
        action    : function () { return this.currentTarget.value === this.currentTarget.defaultValue ? false : this.data.component ; }, // don't log event if nothing is searched
        label     : function () { return this.currentTarget.value; }
      },

      // Links inside the extra info section
      {
        selector  : 'a',
        wrapper   : this.elLk.imageConfigExtras,
        event     : 'click',
        data      : { component: this.component },
        category  : 'Config-TextLink',
        action    : function () { return this.data.component ; },
        label     : function () { return this.getURL(); }
      },

      // 'Enable/disable all tracks' link on top of each track section
      {
        selector  : 'div.select_all li:not(.header)',
        wrapper   : this.elLk.configDivs.not('.view_config'),
        event     : 'click',
        data      : { component: this.component },
        category  : 'Config-TrackStyleAll',
        action    : function () {
                      var subsetEl    = $(this.currentTarget).closest('.subset')[0];
                      var subsetName  = subsetEl.className.replace(/\s*(subset|first)\s*/g, '');
                      return this.data.component + '-' + subsetEl.parentNode.className.replace(/\s*config\s*/, '') + (subsetName ? '-' + subsetName : '');
                    },
        label     : function () { return this.currentTarget.className; }
      },

      // 1. Favourite icon on the right hand side of each track
      // 2. Info icon on the right hand side of each track
      // 3. Track styles (both types included - where there are only two styles on and off and where we get multiple options to select from the popup)
      // 4. Link inside a track's description
      {
        selector  : '.favourite, .menu_help, .popup_menu li:not(.header), .desc a',
        wrapper   : this.elLk.configDivs.not('.view_config'),
        event     : 'click',
        data      : {
                      component : this.component,
                      data      : function () {
                                    var data  = $(this.currentTarget).closest('li.track').data();
                                    if (!data) {
                                      return {};
                                    }
                                    var cls   = this.currentTarget.className;
                                    var rtn   = this.currentTarget.nodeName !== 'A' ? cls.match(/favourite|menu_help/) ? cls.match(/favourite/) ? {
                                      category  : 'Config-TrackFav',
                                      label     : data.track.fav ? 'On' : 'Off'
                                    } : {
                                      category  : 'Config-InfoIcon',
                                      label     : cls.match(/open/) ? 'Open' : 'Close'
                                    } : {
                                      category  : 'Config-TrackStyle',
                                      label     : data.track.renderer
                                    } : {
                                      category  : 'Config-TrackDescLink',
                                      label     : this.getURL()
                                    };

                                    rtn.action = this.data.component + '-' + data.track.id;
                                    return rtn;
                                  }
                    },
        category  : function () { return this.data.data.category; },
        action    : function () { return this.data.data.action; },
        label     : function () { return this.data.data.label; }
      }
    ]);
  },

  updatePage: function (data, delayReload) {
    var panel = this;

    this.base(data, delayReload);

    if (!this.configAppliedEventConfig) {
      this.configAppliedEventConfig = {
        trackStyle  : new Ensembl.GA.EventConfig({ category: 'Config-Applied-TrackStyle', nonInteraction: true }),
        trackFav    : new Ensembl.GA.EventConfig({ category: 'Config-Applied-TrackFav',   nonInteraction: true })
      };
    }

    var imageConfig = $.parseJSON(data.image_config);

    $.each(imageConfig, function (track, config) {
      if ('renderer' in config) {
        Ensembl.GA.sendEvent(panel.configAppliedEventConfig.trackStyle, { action: panel.component + '-' + track, label: config.renderer });
      }
      if ('favourite' in config) {
        Ensembl.GA.sendEvent(panel.configAppliedEventConfig.trackFav, { action: panel.component + '-' + track, label: config.favourite ? 'On' : 'Off' });
      }
    });
  }
});

Ensembl.Panel.ImageExport = Ensembl.Panel.ImageExport.extend({
  init: function () {
    this.base.apply(this, arguments);

    Ensembl.GA.registerConfigs([

      // Radio buttons for selection
      {
        selector  : this.elLk.form.find('input[type=radio]'),
        event     : 'click',
        category  : 'ImageExportRadio',
        action    : function () { return this.currentTarget.value; }

      // Extra options for custom format
      }, {
        selector  : this.elLk.form.find('select, input[type=checkbox]'),
        event     : 'change',
        category  : 'ImageExportCustom',
        action    : function () { return this.currentTarget.name; },
        label     : function () { return this.currentTarget.nodeName === 'INPUT' ? this.currentTarget.checked ? 'On' : 'Off' : this.currentTarget.value; }
      }
    ]);
  }
});

Ensembl.DataTable.orig_DataTableInit = Ensembl.DataTable.dataTableInit;
Ensembl.DataTable.dataTableInit = function() {

  Ensembl.DataTable.orig_DataTableInit.apply(this, arguments);

  Ensembl.GA.registerConfigs([

    // Datatable CSV export icon on the RHS og datatable header
    {
      selector  : this.el.find('.dataTables_export a'),
      event     : 'click',
      category  : 'TableIcon',
      action    : function () { return $(this.currentTarget).closest('.dataTables_top').parent().find('table.data_table').prop('id') || 'MissingTableID'; },
      label     : function () { return this.currentTarget.innerHTML.match(/whole/) ? 'whole' : 'see'; }
    }
  ]);
};

Ensembl.Panel.MultiSpeciesSelector = Ensembl.Panel.MultiSpeciesSelector.extend({
  init: function () {
    this.base.apply(this, arguments);
  },

  updateSelection: function (data, delayReload) {
    var panel = this;
    this.base();

    if (!this.configAppliedEventConfig) {
      this.configAppliedEventConfig = {
        selectSpecies  : new Ensembl.GA.EventConfig({ category: 'SelectSpecies', nonInteraction: true }),
      };
    }
    
    if(this.selection.join(',') !== this.initialSelection) {
      $(this.selection).each(function (i, species) {
        Ensembl.GA.sendEvent(panel.configAppliedEventConfig.selectSpecies, { action: panel.panelType, label:  species});
      });      
    }
  }
});
