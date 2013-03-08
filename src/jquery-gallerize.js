/*!
* jQuery Gallerize Plugin
* https://github.com/nudesign/jquery-gallerize
* version: 0.1.0 (18-JUN-2012)
*/

(function($){

var galleries = []; // object to store intiated galleries
var galleries_index = 0;

var Gallery = function (element, options) {
  var self = this,
      currentSlide = 0,
      settings = options,
      $gallery = $(element),
      $children = $gallery.children(settings.items),
      children_length = $children.length,
      gallery_window = $("<div class='gallery-window'/>"),
      increment = $gallery.width(),
      animate,
      effect,
      paginator;
  this.animation = undefined; //animation of slideShow
  if (settings.items === "") { settings.items = $children.get(0).tagName.toLowerCase(); }
  
  $gallery.css("float", "left");
  gallery_window.css({"position": "relative", "overflow": "hidden"});
  $gallery.wrap(gallery_window);
  gallery_window = $gallery.parent();
  
  /* STARTUP METHODS */
  Gallery.prototype.init = function () {
    
    if (typeof settings.before === "function") {
      settings.before();
    }
    
    setupGallery();
    if (settings.autostart === true && children_length > 1) {
      this.animation = this.startSlideShow(settings.timeout);
    }

    if (settings.paginator === true) {
      paginator = new Paginator(this);
    }
    if (typeof settings.after === "function") {
      settings.after();
    }
  };
  
  function setupGallery () {
      var index;
      switch ( settings.transitionFx )
      {
        case 'noFx':
          $children.css({'display': 'none', 'float': 'left'});
          effect = self.noFx;
          currentSlide = self.moveToSlide(0);
          break;
        case 'fade':
          $children.css({'display': 'none', 'float': 'left'});
          effect = self.fade;
          currentSlide = self.moveToSlide(0);
          break;
        case 'crossFade':
          $children.css({'display': 'none', 'position': 'absolute'});
          effect = self.crossFade;
          currentSlide = self.moveToSlide(0);
          index = children_length;          
          while (index--) {
            $($children.get(index)).css("z-index", index);
          }          
          break;
        case 'slide':
          gallery_window.css({"width": increment, "overflow": "hidden", "position": "relative"});
          $gallery.css('width', children_length * increment + "px");
          $children.css({'float': 'left', 'width': increment});
          effect = self.slide;     
          currentSlide = self.moveToSlide(0);
          break;
        default:
          $.error( settings.transitionFx + ' não é um efeito valido!<br>');
          break;
      }      
  };
  
  function getMaxHeight () {
    var max = 0;
    $children.find("img").each(function () {
      var $this = $(this),
          that = $this,
          height = $this.height || $this.parent() 
      max = Math.max(max, parseInt($this.height(), 10));
    });
    return max;
  };
  /*--------------------------------*/
  /* MOVE METHODS */
   this.moveToSlide = function (index) {
      if (index >= children_length) {
        index = 0;
      }
      else if (index < 0) {
        index = (children_length - 1);
      }
      $($children.removeClass(settings.active_slide_class)[index]).addClass(settings.active_slide_class);
      effect(index);
      currentSlide = index;
      return index; 
  };
  this.moveLeft = function () {
    var $this = $(this);
    if ( this.animate === true
      && settings.stopAfterUserAction === true) {
      this.stopSlideShow();
    }

    currentSlide = this.moveToSlide(--currentSlide);

    if (settings.paginator === true) {
      paginator.moveDefaultPaginatorToSlide(currentSlide);
    }
    return currentSlide;
  };

  this.moveRight = function () {
    var $this = $(this);
    if ( animate === true
      && settings.stopAfterUserAction === true) {
      this.stopSlideShow();
    }
    currentSlide = this.moveToSlide(++currentSlide);
    if (settings.paginator === true) {
      paginator.moveDefaultPaginatorToSlide(currentSlide);
    }
    
    return currentSlide;
  };
  /*----------------------------------------------------*/
  
  /* ANIMATION EFFECTS */
    Gallery.prototype.noFx = function() {
      $children.css('display', 'none');
      $children.filter('.active').css('display', 'block');
    };
    Gallery.prototype.fade = function () {
      $children.stop(true).fadeOut(parseInt(settings.transition_duration / 2, 10));
      $children.filter('.active').delay(parseInt(settings.transition_duration / 2, 10)).fadeIn(parseInt(settings.transition_duration / 2, 10));
    };
    Gallery.prototype.crossFade = function () {
      $children.stop(true).fadeOut(parseInt(settings.transition_duration / 2, 10));
      $children.filter('.active').fadeIn(parseInt(settings.transition_duration / 2, 10));
    };
    Gallery.prototype.slide = function (index) {
      var newLeft = -(index * increment);
      $gallery.stop(true, false).animate({'margin-left': newLeft}, parseInt(settings.transition_duration, 10));
    };
    /*-------------------------------------------------------*/
    
    Gallery.prototype.stopSlideShow = function () {
      var $this = $(this);
      
      if (animate === true) {
        animate = false;
      } 
      else {
        return false;
      }
      clearInterval(this.animation);
      return this.animation;
    };

    Gallery.prototype.startSlideShow = function (timeout) {
      if (settings.autostart === true) {
        animate = true;
      }
      return setInterval(function () {
        self.moveRight();
      }, settings.timeout);
    };
    
    return $.extend({
      $gallery: $gallery,
      $children: $children,
      settings: settings,
      increment: increment,
    }, this);
     
};
//////////////////////////////////////////////////////////////PAGINATOR ////////////////////////////////////////////////////////////////
var Paginator = function (gallery) { 
  var self = this,
      $gallery = gallery.$gallery,
      $paginator,
      $paginator_children,
      paginator_children_length,
      paginator_increment,
      $paginator_left_arrow,
      $paginator_right_arrow,
      paginator_arrow_width,
      maxVisibleThumbs;
  this.currentPaginatorSlide = 0;
  Paginator.prototype.init = function () {
    setupDefaultPaginator();
  };
  
  function setupDefaultPaginator() {
      var $pag_window = $("<div class='paginator-window'/>"),
          $pag = $("<ul class='paginator' />"),
          $this = $(self);
      $pag.css({"min-width": gallery.$children.parents('.gallery-window').width() - (2 * $(".arrow").width())});
      gallery.$children.each(function (i, el) {
        var $el = $(el);
        $el.data('index', i);
        if ($el.data('thumb_src') !== undefined) {
          $pag.append("<li data-index='" + i + "' style='display: inline; float: left;'><img src='" + $(el).data('thumb_src') + "' style='float: left;'></li>");
        }
      });

      gallery.$children.parents('.gallery-window').append($pag);
      $pag.wrap($pag_window);
      $pag_window = $gallery.siblings();
      
      $paginator = $pag_window.children();
      $paginator_children = $pag.children("li");
      paginator_children_length = $paginator_children.length;
      $paginator.on('click.gallerize', function (e) {
        var $li = $(e.target).parents("li");
        if ($li.length !== 1) { return; }
        gallery.stopSlideShow();
        gallery.currentSlide = gallery.moveToSlide($li.data('index'));
        self.currentPaginatorSlide = self.moveDefaultPaginatorToSlide($li.data('index'));
        e.preventDefault();
      });
      
      paginator_left_margin = parseInt($paginator.css("margin-left"), 10);
      
      $paginator_left_arrow = $("<a href='javascript://' class='paginator-arrow arrow left-arrow' />");
      
      $paginator_right_arrow = $("<a href='javascript://' class='paginator-arrow arrow right-arrow' />");
      
      $pag_window.append($paginator_left_arrow).append($paginator_right_arrow);
      
      $paginator_left_arrow = $pag_window.find(".left-arrow");
      $paginator_right_arrow = $pag_window.find(".right-arrow");
      
      $paginator_left_arrow.on('click.gallerize', function ()    { moveDefaultPaginatorLeft(); });
      $paginator_right_arrow.on('click.gallerize', function ()   { moveDefaultPaginatorRight(); });
      $paginator.css('margin-left', $paginator_left_arrow.outerWidth(true));
      
      $(window).load(function () {
        paginator_arrow_width = $paginator_children.outerWidth(true);
        paginator_increment = paginator_arrow_width;
        $pag.css('width' , paginator_children_length * paginator_increment);
        maxVisibleThumbs = (gallery.increment - (2 * paginator_arrow_width)) / paginator_increment;
        maxVisibleThumbs = Math.floor(maxVisibleThumbs);
      });
      if (!maxVisibleThumbs) {
        paginator_increment = $paginator_children.outerWidth(true);
        $pag.css('width' , paginator_children_length * paginator_increment);
        maxVisibleThumbs = (gallery.increment - (2 * paginator_arrow_width)) / paginator_increment;
        maxVisibleThumbs = Math.floor(maxVisibleThumbs);
      }
  };
  this.moveDefaultPaginatorToSlide = function (index) {
    if (paginator_children_length < maxVisibleThumbs) {
      return false;
    }
    if (index >= paginator_children_length - maxVisibleThumbs) {
      index = ( paginator_children_length - maxVisibleThumbs );
    }
    else if (index <= 0){
      index = 0;
    }
    $paginator.stop(true).animate({'margin-left': -((index * paginator_increment ) - paginator_arrow_width )}, (gallery.settings.transition_duration /2) );
    return index;
  };
  
  function moveDefaultPaginatorRight () {
    self.currentPaginatorSlide = self.moveDefaultPaginatorToSlide(self.currentPaginatorSlide + maxVisibleThumbs);
    return self.currentPaginatorSlide;
  };

  function moveDefaultPaginatorLeft () {
    self.currentPaginatorSlide = self.moveDefaultPaginatorToSlide(self.currentPaginatorSlide - maxVisibleThumbs);
    return self.currentPaginatorSlide;
  };
  this.init();
};

var default_settings = {
    timeout: 4000,
    transition_duration: 2000,
    transitionFx: 'crossFade',
    autostart: true,
    stopAfterUserAction: true,
    items: "", // children items selector
    next_button: false, // must be a child of the original gallery element
    prev_button: false, // must be a child of the original gallery element
    active_slide_class: "active",
    active_paginator_class: "active",
    paginator: true
};  

$.fn.gallerize = function(method, options) {
  options = options || {};
  var id,
      settings;

//CHECK IF GALLERY HAS ID
  if ($(this).length < 1) {
    if( (window['console'] !== undefined) ){
      console.log("selector has 0 length");
    }
    return;
  }
  else if (!$(this).data("gallerize-id")) {
    $(this).data("gallerize-id", galleries_index++);
  }
  id = $(this).data("gallerize-id");
//------------------------------------

  if (method && typeof method == 'object') {
    options = method;
    settings = $.extend( { },default_settings, options);
  }
  else if(options && typeof options == 'object'){
   settings = $.extend( { },default_settings, options);
  }
  if (method === 'init') {
    if (!galleries[id]) {
      galleries[id] = new Gallery(this, settings);
      galleries[id].init();
    }
    else {
      $.error("this gallery have already been initiated")
    }
  }
  
  else if ( method === 'startSlideShow') {
      if ( typeof options === 'number' ) {
        settings.timeout = options;
        return galleries[id].animation = galleries[id].startSlideShow(settings.timeout);
      }
      else {
        $.error("invalid input for startSlideShow")
      }
  }

  else if ( method === 'stopSlideShow') {
    return  galleries[id].stopSlideShow();
  }

  else if ( method === 'moveToSlide' ) {
    if ( typeof options === "number" ) { 
      return galleries[id].moveToSlide(options);
   }
    else {
      $.error("invalid input for moveToSlide")
    }
  }
 
 else if (method === 'moveLeft') {
   return galleries[id].moveLeft();
 }
 else if (method === 'moveRight') {
   return galleries[id].moveRight();
 }
  else if ( typeof method === 'object' || !method ) {
    if (!galleries[id]) {
      galleries[id] = new Gallery(this, settings);
    }
    return galleries[id].init();
  }
  else {
    $.error( 'Method ' +  method + ' does not exist on jQuery.gallerize' );
  }

};
})( jQuery );