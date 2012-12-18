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
  this.$children = this.$gallery.children(this.settings.items);
  this.currentSlide = 0;
  this.gallery_window = $("<div class='gallery_window'/>");
  this.increment = this.$gallery.width();
  this.maxHeight = undefined;
  this.effect = undefined;
  if (this.settings.items === "") { this.settings.items = this.$children.get(0).tagName.toLowerCase(); }
  this.gallery_window.css({"width": this.increment, "overflow": "hidden"});
  this.$gallery.wrap(this.gallery_window);
  this.paginator = undefined;
  
  /* STARTUP METHODS */
  Gallery.prototype.init = function () {
    var self = this;
    if (typeof this.settings.before === "function") {
      this.settings.before();
    }
    this.setupGallery();
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
      this.paginator.currentPaginatorSlide = paginator.movePaginatorToSlide(this.currentSlide);
    }

    return this.currentSlide;
  };

  Gallery.prototype.moveRight = function () {
    var $this = $(this);
    
    this.currentSlide = this.moveToSlide(++this.currentSlide);
    
    if (this.settings.paginator === true) {
      this.paginator.currentPaginatorSlide = paginator.movePaginatorToSlide(this.currentSlide);
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
    
    Gallery.prototype.stopSlideShow = function() {
      var $this = $(this);
      clearInterval(this.animation);
      return this.animation;
    };

    Gallery.prototype.startSlideShow = function (timeout) {
      var self = this;
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
        if ($el.data('thumb_src') !== undefined) {
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
      
      this.$paginator_left = $("<a href='javascript://' class='arrow paginatorLeft' />");

      this.$paginator_right = $("<a href='javascript://' class='arrow paginatorRight' />");

      $(".gallery_window").css('position', 'relative');
      $(this.gallery.element).after(this.$paginator_left).after(this.$paginator_right);
      
      this.$paginator_left = $(this.gallery.element).siblings(".paginatorLeft");
      this.$paginator_right = $(this.gallery.element).siblings(".paginatorRight");
      
      this.$paginator_left.on('click.gallerize', function ()    { self.moveDefaultPaginatorLeft();  });
      this.$paginator_right.on('click.gallerize', function ()   { self.moveDefaultPaginatorRight(); });

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
    this.$paginator.stop(true).animate({'margin-left': -((index * this.paginator_increment) - this.$paginator_left.outerWidth(true) )}, (this.gallery.settings.transition_duration /2) );
    return index;
  };
  
  Paginator.prototype.moveDefaultPaginatorRight = function () {
    return this.currentPaginatorSlide = this.moveDefaultPaginatorToSlide(this.currentPaginatorSlide + this.maxVisibleThumbs);
  };

  Paginator.prototype.moveDefaultPaginatorLeft = function () {
    return this.currentPaginatorSlide = this.moveDefaultPaginatorToSlide(this.currentPaginatorSlide - this.maxVisibleThumbs);
  };
  
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
    $.extend(options, settings);
  }
  else if(options && typeof options == 'object'){
    $.extend(options, settings);
  }

  if (method === 'init') {
    if (!galleries[id]) {
      galleries[id] = new Gallery(this, options);
    }
    return galleries[id].init();
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
 
  else if ( typeof method === 'object' || !method ) {
    if (!galleries[id]) {
      tgalleries[id] = new Gallery(this, options);
    }
    return galleries[id].init();
  }
  else {
    $.error( 'Method ' +  method + ' does not exist on jQuery.gallerize' );
  }

};
})( jQuery );
