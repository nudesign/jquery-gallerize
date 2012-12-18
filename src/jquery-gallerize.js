/*!
* jQuery Gallerize Plugin
* https://github.com/nudesign/jquery-gallerize
* version: 0.1.0 (18-JUN-2012)
*/

(function($){
var Gallery = function (element, options) {
  
  this.settings = options;
  this.element = element;
  this.$gallery = $(element);
  this.animation = undefined; //animation of slideShow
  this.$children = this.$gallery.children(this.settings.items);
  this.currentSlide = 0;
  this.gallery_window = $("<div class='gallery_window' />");
  this.increment = this.$gallery.width();
  this.isAnimating = undefined;   
  this.maxHeight = undefined;
  this.effect = undefined;
  if (this.settings.items === "") { this.settings.items = this.$children.get(0).tagName.toLowerCase(); }
  this.gallery_window.css("width", this.increment);
  this.$gallery.wrap(this.gallery_window);
  this.paginator = undefined;
  
  /* STARTUP METHODS */
  Gallery.prototype.init = function () {
    var self = this;
    this.setupGallery();
    //privateMethods.setupPaginator.call($gallery);
    //privateMethods.bindListeners.call($gallery);
    if (this.settings.paginator === true) {
      this.paginator = new Paginator(this);
      this.paginator.init();
    }
    
    $(window).load(function () {
      self.maxHeight = self.getMaxHeight();
      self.$gallery.css('height', self.maxHeight);
    });

    if (this.settings.autostart === true) {
      this.animation = this.startSlideShow(this.settings.timeout);
    }
    
  };
  
  Gallery.prototype.setupGallery = function () {
      var $this = $(this),
          index;
      switch ( this.settings.transitionFx )
      {
        case 'noFx':
          this.effect = this.noFx;
        case 'fade':
          $this.css({'overflow': 'hidden', 'width': this.increment});
          this.$children.css({'display': 'none', 'float': 'left', 'width' : this.increment});
          if (!this.effect) {
            this.effect = this.fade;
          }
          this.currentSlide = this.moveToSlide(0);
          break;
        case 'crossFade':
          $this.css({'overflow': 'hidden', 'width': this.increment});
          this.$children.css({'display': 'none', 'position': 'absolute', 'width' : this.increment});
          this.effect = this.crossFade;
          this.currentSlide = this.moveToSlide(0);
          index = this.$children.length;          
          while (index--) {
            $(this.$children.get(index)).css("z-index", index);
          }          
          break;
        case 'slide':
          $this.css('width', this.$children.length * this.increment);
          this.$children.css({'float': 'left', 'width': this.increment});
          this.effect = this.slide;     
          this.currentSlide = this.moveToSlide(0);
          break;
        default:
          $.error( this.settings.transitionFx + ' não é um efeito valido!<br>');
          break;
      }
  };
  
  Gallery.prototype.getMaxHeight = function () {
    var max = 0,
        $this = $(this);
    this.$children.each(function (i, el) {
      max = Math.max(max, parseInt($(el).height(), 10));
    });
    return max;
  };
  /*--------------------------------*/
  /* MOVE METHODS */
   Gallery.prototype.moveToSlide = function (index) {
      var $this = $(this);
      index = parseInt(index, 10);

      if (index >= this.$children.length) {
        index = 0;
      }
      else if (index < 0) {
        index = (this.$children.length - 1);
      }
      $(this.$children.removeClass(this.settings.active_slide_class)[index]).addClass(this.settings.active_slide_class);

      if (this.$paginator_children !== undefined) {
        $(this.$paginator_children.removeClass(this.settings.active_paginator_class)[index]).addClass(this.settings.active_paginator_class);
      }
      this.effect(index);
      this.currentSlide = index;
    
      return index; 
  };
  Gallery.prototype.moveLeft = function () {
    var $this = $(this);

    this.currentSlide = this.moveToSlide(--this.currentSlide);
    //this.currentPaginatorSlide = privateMethods.movePaginatorToSlide.call(this, this.currentSlide);
    return this.currentSlide;
  };

  Gallery.prototype.moveRight = function () {
    var $this = $(this);
    
    this.currentSlide = this.moveToSlide(++this.currentSlide);
    //this.currentPaginatorSlide = privateMethods.movePaginatorToSlide.call(this, this.currentSlide);
    return this.currentSlide;
  };
  /*----------------------------------------------------*/
  
  /* ANIMATION EFFECTS */
    Gallery.prototype.noFx = function () {
      this.$children.css('display', 'none');
      this.$children.filter('.active').css('display', 'block');
    };
    Gallery.prototype.fade = function () {
      this.$children.stop(true).fadeOut(parseInt(this.settings.transition_duration / 2, 10));
      this.$children.filter('.active').delay(parseInt(this.settings.transition_duration / 2, 10)).fadeIn(parseInt(this.settings.transition_duration / 2, 10));
    };
    Gallery.prototype.crossFade = function () {
      this.$children.stop(true).fadeOut(parseInt(this.settings.transition_duration / 2, 10));
      this.$children.filter('.active').fadeIn(parseInt(this.settings.transition_duration / 2, 10));
    };
    Gallery.prototype.slide = function (index) {
      var newLeft = -(index * this.increment);       
      $(this.gallery).stop(true, false).animate({'margin-left': newLeft}, parseInt(this.settings.transition_duration, 10));
    };
    /*-------------------------------------------------------*/
    Gallery.prototype.stopSlideShow = function() {
      var $this = $(this);
      this.isAnimating = false;
      clearInterval(this.animation);
      return this.animation;
    };

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

var Paginator = function (obj) { 
  this.gallery = obj;
  this.$paginator = undefined;
  this.paginator_children = undefined;
  this.paginator_increment = undefined;
  this.$paginator_left = undefined;
  this.$paginator_right = undefined;
  this.maxVisibleThumbs = undefined;
  this.currentPaginatorSlide = 0;
  
  Paginator.prototype.init = function () {
    this.setupDefaultPaginator();
  };
  
  Paginator.prototype.setupDefaultPaginator = function () {
      var $pag = $("<ul class='paginator' />"),
          $this = $(this),
          self = this;
                
      this.gallery.$children.each(function (i, el) {
        var $el = $(el);
        $el.data('index', i);
        if ($el.data('thumb_src') != undefined) {
          $pag.append("<li data-index='" + i + "'><img src='" + $(el).data('thumb_src') + "'></li>");
        }
      });

      $pag.on('click.gallerize', function (e) {
        $li = $(e.target).parents(self.gallery.settings.items);
        if ($li.length != 1) { return; }
        self.gallery.currentSlide = self.gallery.moveToSlide($li.data('index'));
        self.currentPaginatorSlide = self.moveDefaultPaginatorToSlide($li.data('index'));
        e.preventDefault();
      });
      
      if (settings.stopAfterUserAction === true){
        $pag.one('click.gallerize' , function (){ self.gallery.animation = self.gallery.stopSlideShow(); });
      }

      this.gallery.$children.parents('.gallery_window').append($pag);
      
      this.$paginator_children = $pag.children();
      this.paginator_increment = this.$paginator_children.outerWidth(true);
      
      $pag.css('width' , this.$paginator_children.length * this.paginator_increment);

      this.$paginator = $pag;
      
      this.$paginator_left = $("<a href='javascript://' class='paginatorLeft' />");

      this.$paginator_right = $("<a href='javascript://' class='paginatorRight' />");

      $(".gallery_window").css('position', 'relative');
      this.$paginator.append(this.$paginator_left).append(this.$paginator_right);

      this.$paginator.css('margin-left', this.$paginator_left.outerWidth(true));
      this.maxVisibleThumbs = (this.gallery.increment - (2 * this.$paginator_left.outerWidth(true))) / this.paginator_increment;
      this.maxVisibleThumbs = Math.floor(this.maxVisibleThumbs);
  };
  Paginator.prototype.moveDefaultPaginatorToSlide = function (index) {
    var $this = $(this);
    if (index >= this.$paginator_children.length - this.maxVisibleThumbs) {
      index = ( this.$paginator_children.length - this.maxVisibleThumbs );
    }
    else if (index <= 0){
      index = 0;
    }
    this.$paginator.stop(true).animate({'margin-left': -((index * this.paginator_increment) - this.$paginator_left.outerWidth(true) )}, this.gallery.settings.transition_duration);
    return index;
  };
  
};

var privateMethods = {
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
    paginator: true
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
