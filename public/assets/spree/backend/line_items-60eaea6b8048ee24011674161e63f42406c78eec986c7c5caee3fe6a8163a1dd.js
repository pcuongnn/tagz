(function() {
  var adjustLineItem, deleteLineItem, lineItemURL, toggleLineItemEdit;

  $(document).ready(function() {
    $('a.edit-line-item').click(toggleLineItemEdit);
    $('a.cancel-line-item').click(toggleLineItemEdit);
    $('a.save-line-item').click(function() {
      var line_item_id, quantity, save;
      save = $(this);
      line_item_id = save.data('line-item-id');
      quantity = parseInt(save.parents('tr').find('input.line_item_quantity').val());
      toggleItemEdit();
      adjustLineItem(line_item_id, quantity);
      return false;
    });
    return $('a.delete-line-item').click(function() {
      var del, line_item_id;
      if (confirm(Spree.translations.are_you_sure_delete)) {
        del = $(this);
        line_item_id = del.data('line-item-id');
        toggleItemEdit();
        return deleteLineItem(line_item_id);
      }
    });
  });

  toggleLineItemEdit = function() {
    var link;
    link = $(this);
    link.parent().find('a.edit-line-item').toggle();
    link.parent().find('a.cancel-line-item').toggle();
    link.parent().find('a.save-line-item').toggle();
    link.parent().find('a.delete-line-item').toggle();
    link.parents('tr').find('td.line-item-qty-show').toggle();
    link.parents('tr').find('td.line-item-qty-edit').toggle();
    return false;
  };

  lineItemURL = function(line_item_id) {
    var url;
    return url = Spree.routes.orders_api + "/" + order_number + "/line_items/" + line_item_id + ".json";
  };

  adjustLineItem = function(line_item_id, quantity) {
    var url;
    url = lineItemURL(line_item_id);
    return $.ajax({
      type: "PUT",
      url: Spree.url(url),
      data: {
        line_item: {
          quantity: quantity
        },
        token: Spree.api_key
      }
    }).done(function(msg) {
      return window.Spree.advanceOrder();
    });
  };

  deleteLineItem = function(line_item_id) {
    var url;
    url = lineItemURL(line_item_id);
    return $.ajax({
      type: "DELETE",
      url: Spree.url(url),
      data: {
        token: Spree.api_key
      }
    }).done(function(msg) {
      $('#line-item-' + line_item_id).remove();
      if ($('.line-items tr.line-item').length === 0) {
        $('.line-items').remove();
      }
      return window.Spree.advanceOrder();
    });
  };

}).call(this);
