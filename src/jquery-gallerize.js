/*!
 * jQuery Gallerize Plugin
 * https://github.com/nudesign/jquery-gallerize
 * version: 0.0.2 (18-JUN-2012)
 */

(function($){
 var methods = {
    init: function () {
      return this.each(function(){
        var $this = $(this);
        Vars.increment = $this.width();
        Vars.$gallery_window = $("<div class='gallery_window' />");
        Vars.$gallery_window.css({'overflow': 'hidden', 'width': Vars.increment, 'outline': '1px '});
        Vars.$children = $this.children(settings.items);
        if (settings.items === "") {
          settings.items = Vars.$children.get(0).tagName.toLowerCase();
        }
        $this.wrap(Vars.$gallery_window);
        privateMethods.setupGallery.apply(this);
        privateMethods.setupPaginator();
        privateMethods.bindListeners.apply(this);
        $this.find("img:last").load(function () {
          Vars.maxHeight = privateMethods.getMaxHeight();
          $this.css('height', Vars.maxHeight);
        });
        if (settings.autostart === true) {
          Vars.animation = methods.startSlideShow(settings.timeout);
        }
      });
    },
    
    moveToSlide: function (index) {
      index = parseInt(index, 10);

      if (index >= Vars.$children.length) {
        index = 0;
      }
      else if (index < 0) {
        index = (Vars.$children.length - 1);
      }

        
      $(Vars.$children.removeClass(settings.active_slide_class)[index]).addClass(settings.active_slide_class);

      if (Vars.$paginator_children !== undefined) {
        $(Vars.$paginator_children.removeClass(settings.active_paginator_class)[index]).addClass(settings.active_paginator_class);
      }

      switch (settings.transitionFx) {
        case 'noFx':
          $children.css('display', 'none');
          $children.filter('.active').css('display', 'block');
          break;
        case 'fade':
           Vars.$children.stop(true, true).fadeOut(parseInt(settings.transition_duration / 2, 10));
           setTimeout(function () { Vars.$children.filter('.active').stop(true, true).fadeIn(parseInt(settings.transition_duration / 2, 10)) }, (parseInt(settings.transition_duration / 2, 10) + 100));
           break;
        case 'slide':
          var newLeft = -(index * increment);
          $this.stop(true, false).animate({'margin-left': newLeft}, settings.transition_duration);
            break;
        }

        return index;
      },
      
      moveLeft: function () {
        Vars.currentSlide = methods.moveToSlide(--currentSlide);
        Vars.currentPaginatorSlide = privateMethods.movePaginatorToSlide(currentSlide);
      },

      moveRight: function () {
        Vars.currentSlide = methods.moveToSlide(++currentSlide);
        Vars.currentPaginatorSlide = privateMethods.movePaginatorToSlide(currentSlide);
      },

      stopSlideShow: function() {
        clearInterval(Vars.animation);
        return Vars.animation;
      },

      startSlideShow: function (timeout) {
      console.log("a")
        return setInterval(function () {
          Vars.currentSlide = methods.moveToSlide(++Vars.currentSlide);
          Vars.currentPaginatorSlide = privateMethods.movePaginatorToSlide(Vars.currentSlide);
        }, timeout);
      },
  

  };
  
  var privateMethods = {
    setupGallery: function () {
      return $(this).each(function(){
        var $this = $(this);

        switch (settings.transitionFx)
        {
          case 'noFx':
          case 'fade':
            $this.css({'overflow': 'hidden', 'width': Vars.increment});
            Vars.$children.css({'display': 'none', 'float': 'left', 'width' : Vars.increment});
            Vars.currentSlide = methods.moveToSlide(0);
            break;
          case 'slide':
            $this.css('width', Vars.$children.length * Vars.increment);
            Vars.$children.css({'float': 'left', 'width': Vars.increment});
            Vars.currentSlide = methods.moveToSlide(0);
            break;
          default:
            document.write( settings.transitionFx + ' não é um efeito valido!<br>');
            break;
        }   
      });
    },
    setupPaginator: function () {
      return $(this).each(function(){
        var $pag = $("<ul class='paginator' />");        
        
        Vars.$children.each(function (i, el) {
          var $el = $(el);
          $el.data('index', i);
          if ($el.data('thumb_src') != undefined) {
            $pag.append("<li data-index='" + i + "'><img src='" + $(el).data('thumb_src') + "'></li>");
          }
        });

        $pag.on('click.gallerize', function (e) {
          $li = $(e.target).parents(settings.items);
          if ($li.length != 1) { return; }
          Vars.currentSlide = methods.moveToSlide($li.data('index'));
          Vars.currentPaginatorSlide = privateMethods.movePaginatorToSlide($li.data('index'));
          e.preventDefault();
        });
        if (settings.stopAfterUserAction === true){
          $pag.one('click.gallerize' , function (){ Vars.animation = methods.stopSlideShow(); });
        }

        Vars.$children.parents('.gallery_window').append($pag);
        Vars.$paginator_children = $pag.children();
        
        Vars.paginator_increment = Vars.$paginator_children.outerWidth(true);
        $pag.css('width' , Vars.$paginator_children.length * Vars.paginator_increment);

        Vars.$paginator = $("ul.paginator");
        
        Vars.$paginator_left = $("<a href='javascript://' class='paginatorLeft' />");

        Vars.$paginator_right = $("<a href='javascript://' class='paginatorRight' />");

        $(".gallery_window").css('position', 'relative').append(Vars.$paginator_left).append(Vars.$paginator_right);
        
        Vars.$paginator.css('margin-left', Vars.$paginator_left.outerWidth(true));
        
        Vars.maxVisibleThumbs = (Vars.increment - (2 * Vars.$paginator_left.outerWidth(true))) / Vars.paginator_increment;
        Vars.maxVisibleThumbs = Math.floor(Vars.maxVisibleThumbs);
      });
    },
    
      movePaginatorToSlide: function (index) {
        index = parseInt(index, 10);

        if (index >= Vars.$children.length - Vars.maxVisibleThumbs){
          index = (Vars.$children.length - Vars.maxVisibleThumbs);
        }
        else if (index <= 0){
          index = 0;
        }
        Vars.$paginator.stop(true, false).animate({'margin-left': -((index * Vars.paginator_increment) - Vars.$paginator_left.outerWidth(true) )}, settings.transition_duration);

        return index;
      },

      movePaginatorRight: function () {
        return Vars.currentPaginatorSlide = movePaginatorToSlide(Vars.currentPaginatorSlide + maxVisibleThumbs);
      },

      movePaginatorLeft: function () {
        return Vars.currentPaginatorSlide = movePaginatorToSlide(Vars.currentPaginatorSlide - maxVisibleThumbs );
      },
      
      bindListeners: function () {
        return $(this).each(function(){
          var $this = $(this);
          if (settings.next_button !== false) {
            $this.parents('.gallery_window').find(settings.next_button).on('click.gallerize', function () {
              methods.moveRight();
            });
          }
          if (settings.prev_button !== false) {
            $this.parents('.gallery_window').find(settings.prev_button).on('click.gallerize', function () {
              methods.moveLeft();
            });
          }
          $(document).on('keyup.gallerize', function (e) {
            if (e.keyCode === 37) { methods.moveLeft(); }
            if (e.keyCode === 39) { methods.moveRight(); }
          });
  
          Vars.$paginator_left.on('click.gallerize', function ()    { privateMethods.movePaginatorLeft();  });
          Vars.$paginator_right.on('click.gallerize', function ()   { privateMethods.movePaginatorRight(); });

          // if(settings.stopAfterUserAction === true){
          //   $(document).one('keyup.gallerize', function (e) {
          //     if (e.keyCode === 37) { animation = stopSlideShow(); }
          //     if (e.keyCode === 39) { animation = stopSlideShow(); }
          //   });
          //  $paginator_left.one('click.gallerize', function(){ animation = stopSlideShow(); });
          //  $paginator_right.one('click.gallerize', function(){ animation = stopSlideShow(); });
          // }
        });
      },
      getMaxHeight: function () {
        var max = 0;
        Vars.$children.each(function (i, el) {
          max = Math.max(max, parseInt($(el).height(), 10));
        });
        return max;
      }
      
  };
  
  var Vars = {
      animation: undefined, //animation of slideShow
      $children: undefined,
      currentPaginatorSlide: 0,
      currentSlide: 0,
      $gallery_window: undefined,
      increment: undefined,
      maxHeight: undefined,
      maxVisibleThumbs: undefined,
      $paginator: undefined,
      $paginator_children: undefined,
      paginator_increment: undefined   
  };
  
  var settings = {
      timeout: 4000,
      transition_duration: 1000,
      transitionFx: 'fade',
      autostart: false,
      stopAfterUserAction: true,
      items: "", // children itens selector
      next_button: false, // must be a child of the original gallery element
      prev_button: false, // must be a child of the original gallery element
      active_slide_class: "active",
      active_paginator_class: "active",
      paginator: false  
  };  
  
  $.fn.gallerize = function(method, options) {

    if (method && typeof(method) == 'object') {
      options = method;
      method = undefined;
      $.extend(settings, options);
    }
    else if(options && typeof(options) == 'object'){
      $.extend(settings, options);
    }
    if ( methods[method] ) {
      return methods[method].apply( this, Array.prototype.slice.call( arguments, 1 ));
    } else if ( typeof method === 'object' || ! method ) {
      return methods.init.apply( this, arguments );
    } else {
      $.error( 'Method ' +  method + ' does not exist on jQuery.tooltip' );
    }    
  };
})( jQuery );
