$(function(){var t=$("select#calc_type"),a=t.prop("value");$(".calculator-settings-warning").hide(),t.change(function(){t.prop("value")==a?($("div.calculator-settings").show(),$(".calculator-settings-warning").hide(),$(".calculator-settings").find("input,textarea").prop("disabled",!1)):($("div.calculator-settings").hide(),$(".calculator-settings-warning").show(),$(".calculator-settings").find("input,texttarea").prop("disabled",!0))})});