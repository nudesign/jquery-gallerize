/*!
 * jQuery Gallerize Plugin
 * https://github.com/nudesign/jquery-gallerize
 * version: 0.0.2 (18-JUN-2012)
 */

(function($){
 var methods = {
    init: function () {
      return this.each(function(){
        var $this = $(this),
            self = this,
            data = $this.data('gallerize'),
            gallery_window = $("<div class='gallery_window' />");
            gallery_window.css({'overflow': 'hidden' , 'outline': '1px '}); //tenho que setar 'width': increment,
        if ( ! data ) {
          var increment = $this.width();
              gallery = $this,
              $children = $this.children(settings.items);
              
          gallery_window.css("width", increment);
             
          $(this).data('gallerize', {
            animation: undefined, //animation of slideShow
            $children: $children,
            currentPaginatorSlide: 0,
            currentSlide: 0,
            gallery: gallery,
            gallery_window: gallery_window,
            increment: increment,
            isAnimating: undefined,   
            maxHeight: undefined,
            maxVisibleThumbs: undefined,
            $paginator: undefined,
            $paginator_children: undefined,
            paginator_increment: undefined
            
          });
             
        }
        if (settings.items === "") { settings.items = $children.get(0).tagName.toLowerCase(); }
        $this.wrap(gallery_window);
        privateMethods.setupGallery.call($this);
        privateMethods.setupPaginator.call($this);
        privateMethods.bindListeners.call($this);
        
        var data = $this.data('gallerize');
        $(window).load(function () {
          data.maxHeight = privateMethods.getMaxHeight.call($(self));
          $(self).css('height', data.maxHeight);
        });
        
        if (settings.autostart === true) {
          data.animation = methods.startSlideShow.call(this, settings.timeout);
        }
      });
    },
    moveToSlide: function (index) {
      var $this = $(this),
          data = $this.data("gallerize");
      index = parseInt(index, 10);
      var $this = $(this);

      if (index >= data.$children.length) {
        index = 0;
      }
      else if (index < 0) {
        index = (data.$children.length - 1);
      }
      $(data.$children.removeClass(settings.active_slide_class)[index]).addClass(settings.active_slide_class);

      if (data.$paginator_children !== undefined) {
        $(data.$paginator_children.removeClass(settings.active_paginator_class)[index]).addClass(settings.active_paginator_class);
      }

      switch (settings.transitionFx) {
        case 'noFx':
          $children.css('display', 'none');
          $children.filter('.active').css('display', 'block');
          break;
        case 'fade':
           data.$children.stop(true, true).fadeOut(parseInt(settings.transition_duration / 2, 10));
           setTimeout(function () { data.$children.filter('.active').stop(true, true).fadeIn(parseInt(settings.transition_duration / 2, 10)) }, (parseInt(settings.transition_duration / 2, 10) + 100));
           break;
        case 'slide':
          var newLeft = -(index * data.increment);       
          $(data.gallery).stop(true, false).animate({'margin-left': newLeft}, parseInt(settings.transition_duration, 10));
          break;
        }
        data.currentSlide = index;
        return index; 
      },
      
      moveLeft: function () {
        var $this = $(this),
            data = $this.data('gallerize');
        
        data.currentSlide = methods.moveToSlide.call(this, --data.currentSlide);
        data.currentPaginatorSlide = privateMethods.movePaginatorToSlide.call(this, data.currentSlide);
        return data.currentSlide
      },

      moveRight: function () {
        var $this = $(this),
            data = $this.data('gallerize');
        
        data.currentSlide = methods.moveToSlide.call(this, ++data.currentSlide);
        data.currentPaginatorSlide = privateMethods.movePaginatorToSlide.call(this, data.currentSlide);
        return data.currentSlide
      },
      stopSlideShow: function() {
        var $this = $(this),
            data = $this.data('gallerize');
        data.isAnimating = false;
        clearInterval(data.animation);
        return data.animation;
      },

      startSlideShow: function (timeout) {
        var $this = $(this),
            data = $this.data('gallerize'),
            self = this;
        if (data.isAnimating === true) {
          methods.stopSlideShow.call(this);
        }
        return setInterval(function () {
          parseInt(timeout);
          data.currentSlide = methods.moveToSlide.call($(self), ++data.currentSlide);
          data.currentPaginatorSlide = privateMethods.movePaginatorToSlide.call($(self), data.currentSlide);
        }, timeout);
      },
  };
  
  var privateMethods = {
    setupGallery: function () {
      return this.each( function() {
        var $this = $(this),
            data = $this.data('gallerize');
        switch ( settings.transitionFx )
        {
          case 'noFx':
          case 'fade':
            $this.css({'overflow': 'hidden', 'width': data.increment});
            data.$children.css({'display': 'none', 'float': 'left', 'width' : data.increment});
            data.currentSlide = methods.moveToSlide.call($this, 0);
            break;
          case 'slide':
            $this.css('width', data.$children.length * data.increment);
            data.$children.css({'float': 'left', 'width': data.increment});     
            data.currentSlide = methods.moveToSlide.call($this, 0);      
            break;
          default:
            $.error( settings.transitionFx + ' não é um efeito valido!<br>');
            break;
        }   
      });
    },
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
      },
      getMaxHeight: function () {
        var max = 0,
            $this = $(this),
            data = $this.data("gallerize");
        data.$children.each(function (i, el) {
          max = Math.max(max, parseInt($(el).height(), 10));
        });
        return max;
      }
      
  };
    
  var settings = {
      timeout: 4000,
      transition_duration: 1000,
      transitionFx: 'fade',
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

    if (method && typeof method == 'object') {
      options = method;
      $.extend(settings, options);
    }
    else if(options && typeof options == 'object'){
      $.extend(settings, options);
    }
    if ( methods[method] ) {
      if ( method === 'startSlideShow') {
        if ( typeof options === 'number' ) {
          settings.timeout = options;
          return data.animation = methods.startSlideShow.call(this, options);
        }
        else {
          $.error("startSlideShow input inválido")
        }
      }
      else if ( method === 'moveToSlide' ) {
        if ( typeof options === "number" ) { 
          return methods.moveToSlide.call(this, options);
        }
        else {
          $.error("moveToSlide input inválido")
        }
      }
      else {
        return methods[method].apply( this, Array.prototype.slice.call( arguments, 1 ));
      }
    } else if ( typeof method === 'object' || ! method ) {
        return methods.init.apply( this, arguments );
    } else {
        $.error( 'Method ' +  method + ' does not exist on jQuery.gallerize' );
    }    
  };
})( jQuery );
