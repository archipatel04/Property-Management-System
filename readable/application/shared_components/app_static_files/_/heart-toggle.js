(function($) {
  function toggleHeart(pSelector) {
    $(pSelector).on("click", function() {
      var $icon = $(this);
      if ($icon.hasClass("fa-regular")) {
        $icon.removeClass("fa-regular").addClass("fa-solid").css("color", "red");
      } else {
        $icon.removeClass("fa-solid").addClass("fa-regular").css("color", "");
      }
    });
  }

  apex.plugins.heart_toggle_favorite = {
    initialize: function(pDynamicAction, pContext) {
      toggleHeart(pContext.selector);
    }
  };
})(apex.jQuery);
