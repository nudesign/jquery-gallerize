/*!
* jQuery Gallerize Plugin
* https://github.com/nudesign/jquery-gallerize
* version: 0.1.0 (18-JUN-2012)
*/

(function($){

var galleries = []; // object to store intiated galleries

var Gallery = function (element, options) {

  this.settings = options;
  this.element = element;
  this.$gallery = $(element);
  this.animation = undefined; //animation of slideShow
  this.animate = undefined;
  this.$children = this.$gallery.children(this.settings.items);
  this.currentSlide = 0;
  this.gallery_window = $("<div class='gallery_window'/>");
  this.increment = this.$gallery.width();
  this.maxHeight = undefined;
  this.effect = undefined;
  if (this.settings.items === "") { this.settings.items = this.$children.get(0).tagName.toLowerCase(); }

  this.gallery_window.css({"width": this.increment, "overflow": "hidden", "position": "relative"});
    
  this.$gallery.wrap(this.gallery_window);
  this.gallery_window = this.$gallery.parent();
  this.paginator = undefined;
  
  /* STARTUP METHODS */
  Gallery.prototype.init = function () {
    var self = this;
    
    if (typeof this.settings.before === "function") {
      this.settings.before();
    }

    $(window).load(function () {
      self.maxHeight = self.getMaxHeight();
      self.setupGallery();
      self.$gallery.css('height', self.maxHeight);
      if (self.settings.autostart === true) {
        self.animation = self.startSlideShow(self.settings.timeout);
      }
    });
    
    if (!this.maxHeight) {
      this.maxHeight = this.getMaxHeight();
      this.setupGallery();
      this.$gallery.css('height', this.maxHeight);
      if (this.settings.autostart === true) {
        this.animation = this.startSlideShow(this.settings.timeout);
      }
    }

    if (this.settings.paginator === true) {
      this.paginator = new Paginator(this);
      this.paginator.init();
    }
  };
  
  Gallery.prototype.setupGallery = function () {
      var index;
      if (!this.maxHeight) {
        return false;
      }
      switch ( this.settings.transitionFx )
      {
        case 'noFx':
          this.effect = this.noFx;
        case 'fade':
          this.$gallery.css({'overflow': 'hidden', 'width': this.increment});
          this.$children.css({'display': 'none', 'float': 'left', 'width' : this.increment});
          this.effect = this.fade;
          this.currentSlide = this.moveToSlide(0);
          break;
        case 'crossFade':
          this.$gallery.css({'overflow': 'hidden', 'width': this.increment});
          this.$children.css({'display': 'none', 'position': 'absolute', 'width' : this.increment});
          this.effect = this.crossFade;
          this.currentSlide = this.moveToSlide(0);
          index = this.$children.length;          
          while (index--) {
            $(this.$children.get(index)).css("z-index", index);
          }          
          break;
        case 'slide':
          this.$gallery.css('width', this.$children.length * this.increment);
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
    var max = 0;
    this.$children.find("img").each(function () {
      var $this = $(this),
          that = $this;
      $this.data('dimensions', {
        data_height: that.height(),
        data_width: that.width()
      });
      max = Math.max(max, parseInt($this.height(), 10));
    });
    return max;
  };
  /*--------------------------------*/
  /* MOVE METHODS */
   Gallery.prototype.moveToSlide = function (index) {
      if ( this.animate === true
        && this.settings.stopAfterUserAction === true) {
        this.stopSlideShow();
      }
      
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

    if (this.settings.paginator === true) {
      this.paginator.currentPaginatorSlide = this.paginator.moveDefaultPaginatorToSlide(this.currentSlide);
    }

    return this.currentSlide;
  };

  Gallery.prototype.moveRight = function () {
    var $this = $(this);
    
    this.currentSlide = this.moveToSlide(++this.currentSlide);
    if (this.settings.paginator === true) {
      this.paginator.currentPaginatorSlide = this.paginator.moveDefaultPaginatorToSlide(this.currentSlide);
    }
    
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
    
    Gallery.prototype.stopSlideShow = function () {
      var $this = $(this);
      
      if (this.animate === true) {
        this.animate = false;
      } 
      else {
        return false;
      }
      
      clearInterval(this.animation);
      return this.animation;
    };

    Gallery.prototype.startSlideShow = function (timeout) {
      var self = this;
      if (this.settings.autostart === true) {
        this.animate = true;
      }
      return setInterval(function () {
        self.currentSlide = self.moveToSlide(++self.currentSlide);
        //this.currentPaginatorSlide = privateMethods.movePaginatorToSlide(this.currentSlide);
      }, self.settings.timeout);
    };
};
//////////////////////////////////////////////////////////////PAGINATOR ////////////////////////////////////////////////////////////////
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
      $pag.css("float", "left");
      this.gallery.$children.each(function (i, el) {
        var $el = $(el);
        $el.data('index', i);
        if ($el.data('thumb_src') !== undefined) {
          $pag.append("<li data-index='" + i + "' style='display: inline; float: left;'><img src='" + $(el).data('thumb_src') + "' style='float: left;'></li>");
        }
      });

      $pag.on('click.gallerize', function (e) {
        var $li = $(e.target).parents(self.gallery.settings.items);
        if ($li.length !== 1) { return; }
        self.gallery.currentSlide = self.gallery.moveToSlide($li.data('index'));
        self.currentPaginatorSlide = self.moveDefaultPaginatorToSlide($li.data('index'));
        e.preventDefault();
      });

      this.gallery.$children.parents('.gallery_window').append($pag);
      
      this.$paginator_children = $pag.children("li");
      
      this.$paginator = $pag;
      
      if (self.gallery.settings.full_screen === true ) {
        
        this.$paginator.css({"position": "fixed", "bottom": 0, "z-index": 201});
      }
      
      this.$paginator_left = $("<a href='javascript://' class='arrow paginatorLeft' />");
      
      this.$paginator_right = $("<a href='javascript://' class='arrow paginatorRight' />");
      
      this.$paginator.append(this.$paginator_left).append(this.$paginator_right);
      
      this.$paginator_left = this.$paginator.find(".paginatorLeft");
      this.$paginator_right = this.$paginator.find(".paginatorRight");
      
      this.$paginator_left.on('click.gallerize', function ()    { self.moveDefaultPaginatorLeft(); });
      this.$paginator_right.on('click.gallerize', function ()   { self.moveDefaultPaginatorRight(); });
      this.$paginator.css('margin-left', this.$paginator_left.outerWidth(true));
      
      $(window).load(function () {
        self.paginator_increment = self.$paginator_children.outerWidth(true);
        $pag.css('width' , self.$paginator_children.length * self.paginator_increment);
        self.maxVisibleThumbs = (self.gallery.increment - (2 * self.$paginator_left.outerWidth(true))) / self.paginator_increment;
        self.maxVisibleThumbs = Math.floor(self.maxVisibleThumbs);
      });
  };
  Paginator.prototype.moveDefaultPaginatorToSlide = function (index) {
    var $this = $(this);
    
    if (this.$paginator_children.length < this.maxVisibleThumbs) {
      return false;
    }
    
    if (index >= this.$paginator_children.length - this.maxVisibleThumbs) {
      index = ( this.$paginator_children.length - this.maxVisibleThumbs );
    }
    else if (index <= 0){
      index = 0;
    }
    this.$paginator.stop(true).animate({'margin-left': -((index * this.paginator_increment) - this.$paginator_left.outerWidth(true) )}, (this.gallery.settings.transition_duration /2) );
    return index;
  };
  
  Paginator.prototype.moveDefaultPaginatorRight = function () {
    this.currentPaginatorSlide = this.moveDefaultPaginatorToSlide(this.currentPaginatorSlide + this.maxVisibleThumbs);
    return this.currentPaginatorSlide;
  };

  Paginator.prototype.moveDefaultPaginatorLeft = function () {
    this.currentPaginatorSlide = this.moveDefaultPaginatorToSlide(this.currentPaginatorSlide - this.maxVisibleThumbs);
    return this.currentPaginatorSlide;
  };
  
};

var settings = {
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
    paginator: true,
    full_screen: false
};  

$.fn.gallerize = function(method, options) {
  options = options || {};
  var id;

//CHECK IF GALLERY HAS ID
  if (!$(this).attr("id")) {
    $.error("gallery must have an id");
    return false;
  }
  else {
    id = $(this).attr("id");
  }
//------------------------------------

  if (method && typeof method == 'object') {
    options = method;
    $.extend(settings, options);
  }
  else if(options && typeof options == 'object'){
    $.extend(settings, options);
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
      tgalleries[id] = new Gallery(this, settings);
    }
    return galleries[id].init();
  }
  else {
    $.error( 'Method ' +  method + ' does not exist on jQuery.gallerize' );
  }

};
})( jQuery );