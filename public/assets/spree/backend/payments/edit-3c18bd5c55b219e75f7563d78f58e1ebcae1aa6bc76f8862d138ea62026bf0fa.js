(function() {
  var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  jQuery(function($) {
    var EditPaymentView, Payment, PaymentView, ShowPaymentView, order_id;
    order_id = $('#payments').data('order-id');
    Payment = (function() {
      function Payment(id) {
        this.url = Spree.url(((Spree.routes.payments_api(order_id)) + "/" + id + ".json") + '?token=' + Spree.api_key);
        this.json = $.getJSON(this.url.toString(), (function(_this) {
          return function(data) {
            return _this.data = data;
          };
        })(this));
      }

      Payment.prototype.if_editable = function(callback) {
        return this.json.done(function(data) {
          var ref;
          if ((ref = data.state) === 'checkout' || ref === 'pending') {
            return callback();
          }
        });
      };

      Payment.prototype.update = function(attributes, success) {
        var jqXHR;
        jqXHR = $.ajax({
          type: 'PUT',
          url: this.url.toString(),
          data: {
            payment: attributes
          }
        });
        jqXHR.done((function(_this) {
          return function(data) {
            return _this.data = data;
          };
        })(this));
        return jqXHR.fail(function() {
          var response;
          response = $.parseJSON(jqXHR.responseText);
          return show_flash('error', response.error);
        });
      };

      Payment.prototype.amount = function() {
        return this.data.amount;
      };

      Payment.prototype.display_amount = function() {
        return this.data.display_amount;
      };

      return Payment;

    })();
    PaymentView = (function() {
      function PaymentView($el1, payment1) {
        this.$el = $el1;
        this.payment = payment1;
        this.render();
      }

      PaymentView.prototype.render = function() {
        return this.add_action_button();
      };

      PaymentView.prototype.show = function() {
        this.remove_buttons();
        return new ShowPaymentView(this.$el, this.payment);
      };

      PaymentView.prototype.edit = function() {
        this.remove_buttons();
        return new EditPaymentView(this.$el, this.payment);
      };

      PaymentView.prototype.add_action_button = function() {
        return this.$actions().prepend(this.$new_button(this.action));
      };

      PaymentView.prototype.remove_buttons = function() {
        return this.$buttons().remove();
      };

      PaymentView.prototype.$new_button = function(action) {
        return $("<a><span class='icon icon-" + action + "'></span></a>").attr({
          "class": "payment-action-" + action + " btn btn-default btn-sm icon-link no-text with-tip",
          title: Spree.translations[action]
        }).data({
          action: action
        }).one({
          click: function(event) {
            return event.preventDefault();
          },
          mousedown: function() {
            return $(this).data('clicked', true);
          },
          mouseup: (function(_this) {
            return function() {
              return _this[action]();
            };
          })(this)
        });
      };

      PaymentView.prototype.$buttons = function() {
        return this.$actions().find(".payment-action-" + this.action + ", .payment-action-cancel");
      };

      PaymentView.prototype.$actions = function() {
        return this.$el.find('.actions');
      };

      PaymentView.prototype.$amount = function() {
        return this.$el.find('td.amount');
      };

      return PaymentView;

    })();
    ShowPaymentView = (function(superClass) {
      extend(ShowPaymentView, superClass);

      function ShowPaymentView() {
        return ShowPaymentView.__super__.constructor.apply(this, arguments);
      }

      ShowPaymentView.prototype.action = 'edit';

      ShowPaymentView.prototype.render = function() {
        ShowPaymentView.__super__.render.apply(this, arguments);
        this.set_actions_display();
        this.show_actions();
        return this.show_amount();
      };

      ShowPaymentView.prototype.set_actions_display = function() {
        var width;
        width = this.$actions().width();
        return this.$actions().width(width).css('text-align', 'left');
      };

      ShowPaymentView.prototype.show_actions = function() {
        return this.$actions().find('a').show();
      };

      ShowPaymentView.prototype.show_amount = function() {
        var amount;
        amount = $('<span />').html(this.payment.display_amount()).one('click', (function(_this) {
          return function() {
            return _this.edit().$input().focus();
          };
        })(this));
        return this.$amount().html(amount);
      };

      return ShowPaymentView;

    })(PaymentView);
    EditPaymentView = (function(superClass) {
      extend(EditPaymentView, superClass);

      function EditPaymentView() {
        return EditPaymentView.__super__.constructor.apply(this, arguments);
      }

      EditPaymentView.prototype.action = 'save';

      EditPaymentView.prototype.render = function() {
        EditPaymentView.__super__.render.apply(this, arguments);
        this.hide_actions();
        this.edit_amount();
        return this.add_cancel_button();
      };

      EditPaymentView.prototype.add_cancel_button = function() {
        return this.$actions().append(this.$new_button('cancel'));
      };

      EditPaymentView.prototype.hide_actions = function() {
        return this.$actions().find('a').not(this.$buttons()).hide();
      };

      EditPaymentView.prototype.edit_amount = function() {
        var amount;
        amount = this.$amount();
        return amount.html(this.$new_input(amount.find('span').width()));
      };

      EditPaymentView.prototype.save = function(event) {
        return this.payment.update({
          amount: this.$input().val()
        }).done((function(_this) {
          return function() {
            return _this.show();
          };
        })(this));
      };

      EditPaymentView.prototype.cancel = EditPaymentView.prototype.show;

      EditPaymentView.prototype.$new_input = function(width) {
        var amount;
        amount = this.constructor.normalize_amount(this.payment.display_amount());
        return $('<input />').prop({
          id: 'amount',
          value: amount
        }).width(width).one({
          blur: (function(_this) {
            return function() {
              var clicked;
              clicked = (_this.$buttons().filter(function() {
                return $(this).data('clicked');
              })).length;
              if (!clicked) {
                return _this.save();
              }
            };
          })(this)
        }).css({
          'text-align': 'right'
        });
      };

      EditPaymentView.prototype.$input = function() {
        return this.$amount().find('input');
      };

      EditPaymentView.normalize_amount = function(amount) {
        var separator;
        separator = Spree.translations.currency_separator;
        return amount.replace(RegExp("[^\\d" + separator + "]", "g"), '');
      };

      return EditPaymentView;

    })(PaymentView);
    return $('.admin tr[data-hook=payments_row]').each(function() {
      var $el, payment;
      $el = $(this);
      payment = new Payment($el.prop('id').match(/\d+$/));
      return payment.if_editable(function() {
        return new ShowPaymentView($el, payment);
      });
    });
  });

}).call(this);
