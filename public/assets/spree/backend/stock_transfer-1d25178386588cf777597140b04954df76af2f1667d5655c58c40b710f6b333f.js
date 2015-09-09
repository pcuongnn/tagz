(function() {
  var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  $(function() {
    var TransferAddVariants, TransferLocations, TransferStockItem, TransferVariant, TransferVariants, transfer_add_variants, transfer_locations, transfer_variants;
    TransferVariant = (function() {
      function TransferVariant(variant1) {
        this.variant = variant1;
        this.id = this.variant.id;
        this.name = this.variant.name + " - " + this.variant.sku;
        this.quantity = 0;
      }

      TransferVariant.prototype.add = function(quantity) {
        return this.quantity += quantity;
      };

      return TransferVariant;

    })();
    TransferStockItem = (function(superClass) {
      extend(TransferStockItem, superClass);

      function TransferStockItem(stock_item) {
        this.stock_item = stock_item;
        TransferStockItem.__super__.constructor.call(this, this.stock_item.variant);
        this.count_on_hand = this.stock_item.count_on_hand;
        this.name = this.variant.name + " - " + this.variant.sku + " (" + this.count_on_hand + ")";
      }

      TransferStockItem.prototype.add = function(quantity) {
        this.quantity += quantity;
        if (this.quantity > this.count_on_hand) {
          return this.quantity = this.count_on_hand;
        }
      };

      return TransferStockItem;

    })(TransferVariant);
    TransferLocations = (function() {
      function TransferLocations() {
        this.source = $('#transfer_source_location_id');
        this.destination = $('#transfer_destination_location_id');
        this.source.change((function(_this) {
          return function() {
            return _this.populate_destination();
          };
        })(this));
        $('#transfer_receive_stock').change((function(_this) {
          return function(event) {
            return _this.receive_stock_change(event);
          };
        })(this));
        $.getJSON(Spree.url(Spree.routes.stock_locations_api) + '?token=' + Spree.api_key, (function(_this) {
          return function(data) {
            var location;
            _this.locations = (function() {
              var i, len, ref, results;
              ref = data.stock_locations;
              results = [];
              for (i = 0, len = ref.length; i < len; i++) {
                location = ref[i];
                results.push(location);
              }
              return results;
            })();
            if (_this.locations.length < 2) {
              _this.force_receive_stock();
            }
            _this.populate_source();
            return _this.populate_destination();
          };
        })(this));
      }

      TransferLocations.prototype.force_receive_stock = function() {
        $('#receive_stock_field').hide();
        $('#transfer_receive_stock').prop('checked', true);
        return this.toggle_source_location(true);
      };

      TransferLocations.prototype.is_source_location_hidden = function() {
        return $('#transfer_source_location_id_field').css('visibility') === 'hidden';
      };

      TransferLocations.prototype.toggle_source_location = function(hide) {
        if (hide == null) {
          hide = false;
        }
        this.source.trigger('change');
        if (this.is_source_location_hidden() && !hide) {
          $('#transfer_source_location_id_field').css('visibility', 'visible');
          return $('#transfer_source_location_id_field').show();
        } else {
          $('#transfer_source_location_id_field').css('visibility', 'hidden');
          return $('#transfer_source_location_id_field').hide();
        }
      };

      TransferLocations.prototype.receive_stock_change = function(event) {
        this.toggle_source_location(event.target.checked);
        return this.populate_destination(!event.target.checked);
      };

      TransferLocations.prototype.populate_source = function() {
        this.populate_select(this.source);
        return this.source.trigger('change');
      };

      TransferLocations.prototype.populate_destination = function(except_source) {
        if (except_source == null) {
          except_source = true;
        }
        if (this.is_source_location_hidden()) {
          return this.populate_select(this.destination);
        } else {
          return this.populate_select(this.destination, parseInt(this.source.val()));
        }
      };

      TransferLocations.prototype.populate_select = function(select, except) {
        var i, len, location, ref;
        if (except == null) {
          except = 0;
        }
        select.children('option').remove();
        ref = this.locations;
        for (i = 0, len = ref.length; i < len; i++) {
          location = ref[i];
          if (location.id !== except) {
            select.append($('<option></option>').text(location.name).attr('value', location.id));
          }
        }
        return select.select2();
      };

      return TransferLocations;

    })();
    TransferVariants = (function() {
      function TransferVariants() {
        $('#transfer_source_location_id').change((function(_this) {
          return function() {
            return _this.refresh_variants();
          };
        })(this));
      }

      TransferVariants.prototype.receiving_stock = function() {
        return $("#transfer_receive_stock:checked").length > 0;
      };

      TransferVariants.prototype.refresh_variants = function() {
        if (this.receiving_stock()) {
          return this._search_transfer_variants();
        } else {
          return this._search_transfer_stock_items();
        }
      };

      TransferVariants.prototype._search_transfer_variants = function() {
        return this.build_select(Spree.url(Spree.routes.variants_api), 'product_name_or_sku_cont');
      };

      TransferVariants.prototype._search_transfer_stock_items = function() {
        var stock_location_id;
        stock_location_id = $('#transfer_source_location_id').val();
        return this.build_select(Spree.url(Spree.routes.stock_locations_api + ("/" + stock_location_id + "/stock_items")), 'variant_product_name_or_variant_sku_cont');
      };

      TransferVariants.prototype.format_variant_result = function(result) {
        return result.name + " - " + result.sku;
      };

      TransferVariants.prototype.build_select = function(url, query) {
        return $('#transfer_variant').select2({
          minimumInputLength: 3,
          ajax: {
            url: url,
            datatype: "json",
            data: function(term, page) {
              var query_object;
              query_object = {};
              query_object[query] = term;
              return {
                q: query_object,
                token: Spree.api_key
              };
            },
            results: function(data, page) {
              var result;
              result = data["variants"] || data["stock_items"];
              if (data["stock_items"] != null) {
                result = _(result).map(function(variant) {
                  return variant.variant;
                });
              }
              window.variants = result;
              return {
                results: result
              };
            }
          },
          formatResult: this.format_variant_result,
          formatSelection: function(variant) {
            if (!!variant.options_text) {
              return variant.name + (" (" + variant.options_text + ")") + (" - " + variant.sku);
            } else {
              return variant.name + (" - " + variant.sku);
            }
          }
        });
      };

      return TransferVariants;

    })();
    TransferAddVariants = (function() {
      function TransferAddVariants() {
        this.variants = [];
        this.template = Handlebars.compile($('#transfer_variant_template').html());
        $('#transfer_source_location_id').change((function(_this) {
          return function(event) {
            return _this.clear_variants();
          };
        })(this));
        $('button.transfer_add_variant').click((function(_this) {
          return function(event) {
            event.preventDefault();
            if ($('#transfer_variant').select2('data') != null) {
              return _this.add_variant();
            } else {
              return alert('Please select a variant first');
            }
          };
        })(this));
        $('#transfer-variants-table').on('click', '.transfer_remove_variant', (function(_this) {
          return function(event) {
            event.preventDefault();
            return _this.remove_variant($(event.target));
          };
        })(this));
        $('button.transfer_transfer').click((function(_this) {
          return function() {
            if (!(_this.variants.length > 0)) {
              alert('no variants to transfer');
              return false;
            }
          };
        })(this));
      }

      TransferAddVariants.prototype.add_variant = function() {
        var quantity, variant;
        variant = $('#transfer_variant').select2('data');
        quantity = parseInt($('#transfer_variant_quantity').val());
        variant = this.find_or_add(variant);
        variant.add(quantity);
        return this.render();
      };

      TransferAddVariants.prototype.find_or_add = function(variant) {
        var existing;
        if (existing = _.find(this.variants, function(v) {
          return v.id === variant.id;
        })) {
          return existing;
        } else {
          variant = new TransferVariant($.extend({}, variant));
          this.variants.push(variant);
          return variant;
        }
      };

      TransferAddVariants.prototype.remove_variant = function(target) {
        var v, variant_id;
        variant_id = parseInt(target.data('variantId'));
        this.variants = (function() {
          var i, len, ref, results;
          ref = this.variants;
          results = [];
          for (i = 0, len = ref.length; i < len; i++) {
            v = ref[i];
            if (v.id !== variant_id) {
              results.push(v);
            }
          }
          return results;
        }).call(this);
        return this.render();
      };

      TransferAddVariants.prototype.clear_variants = function() {
        this.variants = [];
        return this.render();
      };

      TransferAddVariants.prototype.contains = function(id) {
        return _.contains(_.pluck(this.variants, 'id'), id);
      };

      TransferAddVariants.prototype.render = function() {
        var rendered;
        if (this.variants.length === 0) {
          $('#transfer-variants-table').hide();
          return $('.no-objects-found').show();
        } else {
          $('#transfer-variants-table').show();
          $('.no-objects-found').hide();
          rendered = this.template({
            variants: this.variants
          });
          return $('#transfer_variants_tbody').html(rendered);
        }
      };

      return TransferAddVariants;

    })();
    if ($('#transfer_source_location_id').length > 0) {
      transfer_locations = new TransferLocations;
      transfer_variants = new TransferVariants;
      return transfer_add_variants = new TransferAddVariants;
    }
  });

}).call(this);
