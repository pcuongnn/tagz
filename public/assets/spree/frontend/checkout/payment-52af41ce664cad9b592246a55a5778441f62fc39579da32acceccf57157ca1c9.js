(function(){Spree.ready(function(e){return Spree.onPayment=function(){return e("#checkout_form_payment").is("*")?(e("#existing_cards").is("*")&&(e("#payment-method-fields").hide(),e("#payment-methods").hide(),e("#use_existing_card_yes").click(function(){return e("#payment-method-fields").hide(),e("#payment-methods").hide(),e(".existing-cc-radio").prop("disabled",!1)}),e("#use_existing_card_no").click(function(){return e("#payment-method-fields").show(),e("#payment-methods").show(),e(".existing-cc-radio").prop("disabled",!0)})),e(".cardNumber").payment("formatCardNumber"),e(".cardExpiry").payment("formatCardExpiry"),e(".cardCode").payment("formatCardCVC"),e(".cardNumber").change(function(){return e(this).parent().siblings(".ccType").val(e.payment.cardType(this.value))}),e('input[type="radio"][name="order[payments_attributes][][payment_method_id]"]').click(function(){return e("#payment-methods li").hide(),this.checked?e("#payment_method_"+this.value).show():void 0}),e(document).on("click","#cvv_link",function(t){var r,n;return r="cvv_info",n="left=20,top=20,width=500,height=500,toolbar=0,resizable=0,scrollbars=1",window.open(e(this).attr("href"),r,n),t.preventDefault()}),e('input[type="radio"]:checked').click(),e("#checkout_form_payment").submit(function(){var t,r,n,o;return r=e("#order_coupon_code"),t=e.trim(r.val()),""!==t?(0===e("#coupon_status").length?(n=e("<div id='coupon_status'></div>"),r.parent().append(n)):n=e("#coupon_status"),o=Spree.url(Spree.routes.apply_coupon_code(Spree.current_order_id),{order_token:Spree.current_order_token,coupon_code:t}),n.removeClass(),e.ajax({async:!1,method:"PUT",url:o,success:function(e){return r.val(""),n.addClass("alert-success").html("Coupon code applied successfully."),!0},error:function(t){var r;return r=JSON.parse(t.responseText),n.addClass("alert-error").html(r.error),e(".continue").attr("disabled",!1),!1}})):void 0})):void 0},Spree.onPayment()})}).call(this);