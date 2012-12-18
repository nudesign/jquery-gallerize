/*!
* jQuery Gallerize Plugin
* https://github.com/nudesign/jquery-gallerize
* version: 0.0.2 (18-JUN-2012)
*/

(function($){
var Gallery = function (element, options) {
  Gallery.prototype.init = function () {
    var self = this;
    this.settings = options;
    this.element = element;
    this.$gallery = $(element);
    this.animation = undefined; //animation of slideShow
    this.$children = this.$gallery.children(this.settings.items);
    this.currentPaginatorSlide = 0;
    this.currentSlide = 0;
    this.gallery_window = $("<div class='gallery_window' />");
    this.increment = this.$gallery.width();
    this.isAnimating = undefined;   
    this.maxHeight = undefined;
    this.maxVisibleThumbs = undefined;
    this.$paginator = undefined;
    this.$paginator_children = undefined;
    this.paginator_increment = undefined;        
    if (settings.items === "") { settings.items = this.$children.get(0).tagName.toLowerCase(); }
    this.gallery_window.css("width", this.increment);
    this.$gallery.wrap(this.gallery_window);

    this.setupGallery();
    //privateMethods.setupPaginator.call($gallery);
    //privateMethods.bindListeners.call($gallery);
    $(window).load(function () {
      self.maxHeight = self.getMaxHeight();
      self.$gallery.css('height', self.maxHeight);
    });

    if (settings.autostart === true) {
      this.animation = this.startSlideShow(settings.timeout);
    }

  };
   Gallery.prototype.setupGallery = function () {
      var $this = $(this),
          index;
      switch ( settings.transitionFx )
      {
        case 'noFx':
        case 'fade':
          $this.css({'overflow': 'hidden', 'width': this.increment});
          this.$children.css({'display': 'none', 'float': 'left', 'width' : this.increment});
          this.currentSlide = this.moveToSlide(0);
          break;
        case 'crossFade':
          $this.css({'overflow': 'hidden', 'width': this.increment});
          this.$children.css({'display': 'none', 'position': 'absolute', 'width' : this.increment});
          this.currentSlide = this.moveToSlide(0);
          index = this.$children.length;
          while (index--) {
            $(this.$children.get(index)).css("z-index", index);
          }
          break
        case 'slide':
          $this.css('width', this.$children.length * this.increment);
          this.$children.css({'float': 'left', 'width': this.increment});     
          this.currentSlide = this.moveToSlide(0);      
          break;
        default:
          $.error( settings.transitionFx + ' não é um efeito valido!<br>');
          break;
      }   
  };
   Gallery.prototype.moveToSlide = function (index) {
    var $this = $(this),
    index = parseInt(index, 10);

    if (index >= this.$children.length) {
      index = 0;
    }
    else if (index < 0) {
      index = (this.$children.length - 1);
    }
    $(this.$children.removeClass(settings.active_slide_class)[index]).addClass(settings.active_slide_class);

    if (this.$paginator_children !== undefined) {
      $(this.$paginator_children.removeClass(settings.active_paginator_class)[index]).addClass(settings.active_paginator_class);
    }

    switch (settings.transitionFx) {
      case 'noFx':
        $children.css('display', 'none');
        $children.filter('.active').css('display', 'block');
        break;
      case 'fade':
         this.$children.stop(true).fadeOut(parseInt(settings.transition_duration / 2, 10));
         this.$children.filter('.active').delay(parseInt(settings.transition_duration / 2, 10)).fadeIn(parseInt(settings.transition_duration / 2, 10));
         break;
      case 'crossFade':
        this.$children.stop(true).fadeOut(parseInt(settings.transition_duration / 2, 10));
        this.$children.filter('.active').fadeIn(parseInt(settings.transition_duration / 2, 10));
      case 'slide':
        var newLeft = -(index * this.increment);       
        $(this.gallery).stop(true, false).animate({'margin-left': newLeft}, parseInt(settings.transition_duration, 10));
        break;
      }
      this.currentSlide = index;
      return index; 
    },

    Gallery.prototype.getMaxHeight = function () {
      var max = 0,
          $this = $(this);
      this.$children.each(function (i, el) {
        max = Math.max(max, parseInt($(el).height(), 10));
      });
      return max;
    },

    Gallery.prototype.moveLeft = function () {
      var $this = $(this);

      this.currentSlide = methods.moveToSlide(--this.currentSlide);
      //this.currentPaginatorSlide = privateMethods.movePaginatorToSlide.call(this, this.currentSlide);
      return this.currentSlide
    },

    Gallery.prototype.moveRight = function () {
      var $this = $(this);
      
      this.currentSlide = methods.moveToSlide(++this.currentSlide);
      //this.currentPaginatorSlide = privateMethods.movePaginatorToSlide.call(this, this.currentSlide);
      return this.currentSlide
    },
    Gallery.prototype.stopSlideShow = function() {
      var $this = $(this);
      this.isAnimating = false;
      clearInterval(this.animation);
      return this.animation;
    },

    Gallery.prototype.startSlideShow = function (timeout) {
      var self = this;
      if (this.isAnimating === true) {
        this.stopSlideShow();
      }
      return setInterval(function () {
        self.currentSlide = self.moveToSlide(++self.currentSlide);
        //this.currentPaginatorSlide = privateMethods.movePaginatorToSlide(this.currentSlide);
      }, self.settings.timeout);
    };
};

var Paginator = function () {
  Paginator.prototype.init = function () {

  }
}

var privateMethods = {
 
  setupPaginator: function () {
      var $pag = $("<ul class='paginator' />"),
          $this = $(this),
          self = this,
          data = $this.data("gallerize");        
      
      data.$children.each(function (i, el) {
        var $el = $(el);
        $el.data('index', i);
        if ($el.data('thumb_src') != undefined) {
          $pag.append("<li data-index='" + i + "'><img src='" + $(el).data('thumb_src') + "'></li>");
        }
      });

      $pag.on('click.gallerize', function (e) {
        $li = $(e.target).parents(settings.items);
        if ($li.length != 1) { return; }
        data.currentSlide = methods.moveToSlide.call($(self), $li.data('index'));
        data.currentPaginatorSlide = privateMethods.movePaginatorToSlide.call($(self), $li.data('index'));
        e.preventDefault();
      });
      if (settings.stopAfterUserAction === true){
        $pag.one('click.gallerize' , function (){ data.animation = methods.stopSlideShow.call($(self)); });
      }

      data.$children.parents('.gallery_window').append($pag);
      data.$paginator_children = $pag.children();
      
      data.paginator_increment = data.$paginator_children.outerWidth(true);
      $pag.css('width' , data.$paginator_children.length * data.paginator_increment);

      data.$paginator = $(this).parent().find(".paginator");
      
      data.$paginator_left = $("<a href='javascript://' class='paginatorLeft' />");

      data.$paginator_right = $("<a href='javascript://' class='paginatorRight' />");

      $(".gallery_window").css('position', 'relative');
      $(this).parent().append(data.$paginator_left).append(data.$paginator_right);
      
      data.$paginator.css('margin-left', data.$paginator_left.outerWidth(true));
      
      data.maxVisibleThumbs = (data.increment - (2 * data.$paginator_left.outerWidth(true))) / data.paginator_increment;
      data.maxVisibleThumbs = Math.floor(data.maxVisibleThumbs);
  },
  
    movePaginatorToSlide: function (index) {
      var $this = $(this),
          data = $this.data('gallerize');
      index = parseInt(index, 10);

      if (index >= data.$children.length - data.maxVisibleThumbs){
        index = (data.$children.length - data.maxVisibleThumbs);
      }
      else if (index <= 0){
        index = 0;
      }
      data.$paginator.stop(true, false).animate({'margin-left': -((index * data.paginator_increment) - data.$paginator_left.outerWidth(true) )}, settings.transition_duration);

      return index;
    },

    movePaginatorRight: function () {
      var $this = $(this),
          data = $this.data("gallerize");
      return data.currentPaginatorSlide = privateMethods.movePaginatorToSlide.call(this, data.currentPaginatorSlide + data.maxVisibleThumbs);
    },

    movePaginatorLeft: function () {
      var $this = $(this),
          data = $this.data("gallerize");
      return data.currentPaginatorSlide = privateMethods.movePaginatorToSlide.call(this, data.currentPaginatorSlide - data.maxVisibleThumbs );
    },
    
    bindListeners: function () {
      return $(this).each(function(){
        var self = this,
            $this = $(this),
            data = $this.data("gallerize");
        
        if (settings.next_button !== false) {
          $this.parents('.gallery_window').find(settings.next_button).on('click.gallerize', function () {
            methods.moveRight.call($(self));
          });
        }
        if (settings.prev_button !== false) {
          $this.parents('.gallery_window').find(settings.prev_button).on('click.gallerize', function () {
            methods.moveLeft.call($(self));
          });
        }
        $(document).on('keyup.gallerize', function (e) {
          if (e.keyCode === 37) { methods.moveLeft.call($(self)); }
          if (e.keyCode === 39) { methods.moveRight.call($(self)); }
        });

        data.$paginator_left.on('click.gallerize', function ()    { privateMethods.movePaginatorLeft.call($(self));  });
        data.$paginator_right.on('click.gallerize', function ()   { privateMethods.movePaginatorRight.call($(self)); });

      });
    }
    
};
  
var settings = {
    timeout: 4000,
    transition_duration: 2000,
    transitionFx: 'crossFade',
    autostart: true,
    stopAfterUserAction: true,
    items: "", // children itens selector
    next_button: false, // must be a child of the original gallery element
    prev_button: false, // must be a child of the original gallery element
    active_slide_class: "active",
    active_paginator_class: "active",
    paginator: false  
};  

$.fn.gallerize = function(method, options) {
  this.gallery = [];
  options = options || {};
  if (method && typeof method == 'object') {
    options = method;
    $.extend(options, settings);
  }
  else if(options && typeof options == 'object'){
    $.extend(options, settings);
  }

  if (method === 'init') {
    if (!this.gallery[$(this).attr("id")]) {
      this.gallery[$(this).attr("id")] = new Gallery(this, options);
    }
    this.gallery[$(this).attr("id")].init();
  }

  // if ( methods[method] ) {
  //   if ( method === 'startSlideShow') {
  //     if ( typeof options === 'number' ) {
  //       settings.timeout = options;
  //       return data.animation = methods.startSlideShow.call(this, options);
  //     }
  //     else {
  //       $.error("startSlideShow input inválido")
  //     }
  //   }
  //   else if ( method === 'moveToSlide' ) {
  //     if ( typeof options === "number" ) { 
  //       return methods.moveToSlide.call(this, options);
  //     }
  //     else {
  //       $.error("moveToSlide input inválido")
  //     }
  //   }
  //   else {
  //     return methods[method].apply( this, Array.prototype.slice.call( arguments, 1 ));
  //   }
  // } else if ( typeof method === 'object' || ! method ) {
  //     return methods.init.apply( this, arguments );
  // } else {
  //     $.error( 'Method ' +  method + ' does not exist on jQuery.gallerize' );
  // }    
};
})( jQuery );
