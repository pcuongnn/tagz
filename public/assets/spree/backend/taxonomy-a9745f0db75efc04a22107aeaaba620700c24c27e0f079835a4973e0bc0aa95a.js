(function() {
  var handle_ajax_error, handle_create, handle_delete, handle_move, handle_rename, root;

  handle_ajax_error = function(XMLHttpRequest, textStatus, errorThrown) {
    $.jstree.rollback(last_rollback);
    return $("#ajax_error").show().html("<strong>" + server_error + "</strong><br />" + taxonomy_tree_error);
  };

  handle_move = function(e, data) {
    var last_rollback, new_parent, node, position, url;
    last_rollback = data.rlbk;
    position = data.rslt.cp;
    node = data.rslt.o;
    new_parent = data.rslt.np;
    url = Spree.url(base_url).clone();
    url.setPath(url.path() + '/' + node.prop("id"));
    $.ajax({
      type: "POST",
      dataType: "json",
      url: url.toString(),
      data: {
        _method: "put",
        "taxon[parent_id]": new_parent.prop("id"),
        "taxon[child_index]": position,
        token: Spree.api_key
      },
      error: handle_ajax_error
    });
    return true;
  };

  handle_create = function(e, data) {
    var last_rollback, name, new_parent, node, position;
    last_rollback = data.rlbk;
    node = data.rslt.obj;
    name = data.rslt.name;
    position = data.rslt.position;
    new_parent = data.rslt.parent;
    return $.ajax({
      type: "POST",
      dataType: "json",
      url: base_url.toString(),
      data: {
        "taxon[name]": name,
        "taxon[parent_id]": new_parent.prop("id"),
        "taxon[child_index]": position,
        token: Spree.api_key
      },
      error: handle_ajax_error,
      success: function(data, result) {
        return node.prop('id', data.id);
      }
    });
  };

  handle_rename = function(e, data) {
    var last_rollback, name, node, url;
    last_rollback = data.rlbk;
    node = data.rslt.obj;
    name = data.rslt.new_name;
    url = Spree.url(base_url).clone();
    url.setPath(url.path() + '/' + node.prop("id"));
    return $.ajax({
      type: "POST",
      dataType: "json",
      url: url.toString(),
      data: {
        _method: "put",
        "taxon[name]": name,
        token: Spree.api_key
      },
      error: handle_ajax_error
    });
  };

  handle_delete = function(e, data) {
    var delete_url, last_rollback, node, response;
    last_rollback = data.rlbk;
    node = data.rslt.obj;
    delete_url = base_url.clone();
    delete_url.setPath(delete_url.path() + '/' + node.prop("id"));
    response = confirm(Spree.translations.are_you_sure_delete);
    if (response) {
      return $.ajax({
        type: "POST",
        dataType: "json",
        url: delete_url.toString(),
        data: {
          _method: "delete",
          token: Spree.api_key
        },
        error: handle_ajax_error
      });
    } else {
      $.jstree.rollback(last_rollback);
      return last_rollback = null;
    }
  };

  root = typeof exports !== "undefined" && exports !== null ? exports : this;

  root.setup_taxonomy_tree = function(taxonomy_id) {
    var $taxonomy_tree;
    $taxonomy_tree = $("#taxonomy_tree");
    if (taxonomy_id !== void 0) {
      root.base_url = Spree.url(Spree.routes.taxonomy_taxons_path);
      $.ajax({
        url: Spree.url(base_url.path().replace("/taxons", "/jstree")).toString(),
        data: {
          token: Spree.api_key
        },
        success: function(taxonomy) {
          var conf, last_rollback;
          last_rollback = null;
          conf = {
            json_data: {
              data: taxonomy,
              ajax: {
                url: function(e) {
                  return Spree.url(base_url.path() + '/' + e.prop('id') + '/jstree' + '?token=' + Spree.api_key).toString();
                }
              }
            },
            themes: {
              theme: "spree",
              url: Spree.url(Spree.routes.jstree_theme_path)
            },
            strings: {
              new_node: new_taxon,
              loading: Spree.translations.loading + "..."
            },
            crrm: {
              move: {
                check_move: function(m) {
                  var new_parent, node, position;
                  position = m.cp;
                  node = m.o;
                  new_parent = m.np;
                  if (!new_parent || node.prop("rel") === "root") {
                    return false;
                  }
                  if (new_parent.prop("id") === "taxonomy_tree" && position === 0) {
                    return false;
                  }
                  return true;
                }
              }
            },
            contextmenu: {
              items: function(obj) {
                return taxon_tree_menu(obj, this);
              }
            },
            plugins: ["themes", "json_data", "dnd", "crrm", "contextmenu"]
          };
          return $taxonomy_tree.jstree(conf).bind("move_node.jstree", handle_move).bind("remove.jstree", handle_delete).bind("create.jstree", handle_create).bind("rename.jstree", handle_rename).bind("loaded.jstree", function() {
            return $(this).jstree("core").toggle_node($('.jstree-icon').first());
          });
        }
      });
      $taxonomy_tree.on("dblclick", "a", function(e) {
        return $taxonomy_tree.jstree("rename", this);
      });
      return $(document).keypress(function(e) {
        if (e.keyCode === 13) {
          return e.preventDefault();
        }
      });
    }
  };

}).call(this);
