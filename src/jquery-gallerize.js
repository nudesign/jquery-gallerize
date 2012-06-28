/*!
 * jQuery Gallerize Plugin
 * https://github.com/nudesign/jquery-gallerize
 * version: 0.0.1 (18-JUN-2012)
 */

(function($){
  $.fn.gallerize = function(options) {

    var settings = $.extend({
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
    }, options);

    return this.each(function() {

      var $this = $(this);
      var animation; //animation of slideShow
      var $children;
      var currentPaginatorSlide = 0;
      var currentSlide = 0;
      var $gallery_window;
      var increment = $this.width();
      var maxHeight;
      var maxVisibleThumbs;
      var $paginator;
      var $paginator_children;
      var paginator_increment;



      var init = function () {
        $gallery_window = $("<div class='gallery_window' />").css({'overflow': 'hidden', 'width': increment, 'outline': '1px '});

        $children = $this.children(settings.items);
        if (settings.items === "") {
          settings.items = $children.get(0).tagName.toLowerCase();
        }
        $this.wrap($gallery_window);
        setupGallery();
        setupPaginator();
        bindListeners();
        if (settings.autostart === true) {
          animation = startSlideShow(settings.timeout);
        }
      }
/******************GALLERY**********************/
      var setupGallery = function() {
        switch (settings.transitionFx)
        {
          case 'noFx':
          case 'fade':
            $this.css({'overflow': 'hidden', 'width': increment});
            $children.css({'display': 'none', 'float': 'left', 'width' : increment});
            currentSlide = moveToSlide(0);
            break;
          case 'slide':
            $this.css('width', $children.length * increment);
            $children.css({'float': 'left', 'width': increment});
            currentSlide = moveToSlide(0);
            break;
          default:
            document.write( settings.transitionFx + ' não é um efeito valido!<br>');
            break;
        }
      }

      var moveToSlide = function (index) {
        index = parseInt(index, 10);

        if (index >= $children.length) {
          index = 0;
        }
        else if (index < 0) {
          index = ($children.length - 1);
        }

        
        $($children.removeClass(settings.active_slide_class)[index]).addClass(settings.active_slide_class);

        if ($paginator_children !== undefined) {
          $($paginator_children.removeClass(settings.active_paginator_class)[index]).addClass(settings.active_paginator_class);
        }

        switch (settings.transitionFx) {
          case 'noFx':
            $children.css('display', 'none');
            $children.filter('.active').css('display', 'block');
            break;
          case 'fade':
             $children.stop(true, true).fadeOut(parseInt(settings.transition_duration / 2, 10));
             setTimeout(function () { $children.filter('.active').stop(true, true).fadeIn(parseInt(settings.transition_duration / 2, 10)) }, (parseInt(settings.transition_duration / 2, 10) + 100));
             break;
          case 'slide':
            var newLeft = -(index * increment);
            $this.stop(true, false).animate({'margin-left': newLeft}, settings.transition_duration, function () {
            });
            break;
        }

        return index;
      };

      var moveLeft = function () {
        currentSlide = moveToSlide(--currentSlide);
        currentPaginatorSlide = movePaginatorToSlide(currentSlide);
      };

      var moveRight = function () {
        currentSlide = moveToSlide(++currentSlide);
        currentPaginatorSlide = movePaginatorToSlide(currentSlide);
      };
/******************GALLERY PAGINATOR*******************/
      var setupPaginator = function () {
        $pag = $("<ul class='paginator' />");        
        
        $children.each(function (i, el) {
          var $el = $(el);
          $el.data('index', i);
          if ($el.data('thumb_src') != undefined) {
            $pag.append("<li data-index='" + i + "'><img src='" + $(el).data('thumb_src') + "'></li>");
          }
        });

        $pag.on('click.gallerize', function (e) {
          $li = $(e.target).parents(settings.items);
          if ($li.length != 1) { return; }
          currentSlide = moveToSlide($li.data('index'));
          currentPaginatorSlide = movePaginatorToSlide($li.data('index'));
          e.preventDefault();
        });
        if (settings.stopAfterUserAction === true){
          $pag.one('click.gallerize' , function (){ animation = stopSlideShow(); });
        }

        $children.parents('.gallery_window').append($pag);
        $paginator_children = $pag.children();
        
        paginator_increment = $paginator_children.outerWidth(true);
        $pag.css('width' , $paginator_children.length * paginator_increment);

        $paginator = $("ul.paginator");
        
        $paginator_left = $("<a href='javascript://' class='paginatorLeft' />");

        $paginator_right = $("<a href='javascript://' class='paginatorRight' />");

        $(".gallery_window").css('position', 'relative').append($paginator_left).append($paginator_right);
        
        $paginator.css('margin-left', $paginator_left.outerWidth(true));
        
        maxVisibleThumbs = (increment - (2 * $paginator_left.outerWidth(true))) / paginator_increment;
        maxVisibleThumbs = Math.floor(maxVisibleThumbs);
      }

      var movePaginatorToSlide = function (index) {
        index = parseInt(index, 10);

        if (index >= $children.length - maxVisibleThumbs){
          index = ($children.length - maxVisibleThumbs);
        }
        else if (index <= 0){
          index = 0;
        }
        $paginator.stop(true, false).animate({'margin-left': -((index * paginator_increment) - $paginator_left.outerWidth(true) )}, settings.transition_duration);

        return index;
      }

      var movePaginatorRight = function () {
        currentPaginatorSlide = movePaginatorToSlide(currentPaginatorSlide + maxVisibleThumbs);
      };

      var movePaginatorLeft = function () {
        currentPaginatorSlide = movePaginatorToSlide(currentPaginatorSlide - maxVisibleThumbs );
      };
      
      var getPaginatorChildren = function () {
        return $this.parents(".gallery_window").find(settings.paginator_class).children();
      }

/******************GALLERY SLIDESHOW**********************/
      var stopSlideShow = function() {
        clearInterval(animation);
        return false;
      }

      var startSlideShow = function (timeout) {
        return setInterval(function () {
          currentSlide = moveToSlide(++currentSlide);
          currentPaginatorSlide = movePaginatorToSlide(currentSlide);
        }, timeout);
      }
/******************OTHER FUNCTIONS*********************/
      var getMaxHeight = function () {
        var max = 0;
        $children.each(function (i, el) {
          max = Math.max(max, parseInt($(el).height(), 10));
        });
        return max;
      }
      $this.find("img:last").load(function () {
        maxHeight = getMaxHeight();
        $this.css('height', maxHeight);
      });

      var bindListeners = function () {
        if (settings.next_button !== false) {
          $this.parents('.gallery_window').find(settings.next_button).on('click.gallerize', function () {
            moveRight();
          });
        }
        if (settings.prev_button !== false) {
          $this.parents('.gallery_window').find(settings.prev_button).on('click.gallerize', function () {
            moveLeft();
          });
        }
        $(document).on('keyup.gallerize', function (e) {
          if (e.keyCode === 37) { moveLeft(); }
          if (e.keyCode === 39) { moveRight(); }
        });

        $paginator_left.on('click.gallerize', function ()    { movePaginatorLeft();  });
        $paginator_right.on('click.gallerize', function ()   { movePaginatorRight(); });

        // if(settings.stopAfterUserAction === true){
        //   $(document).one('keyup.gallerize', function (e) {
        //     if (e.keyCode === 37) { animation = stopSlideShow(); }
        //     if (e.keyCode === 39) { animation = stopSlideShow(); }
        //   });
        //  $paginator_left.one('click.gallerize', function(){ animation = stopSlideShow(); });
        //  $paginator_right.one('click.gallerize', function(){ animation = stopSlideShow(); });
        // }
      }

      init();
      
      if (settings.paginator !== false) {
        settings.paginator();
        $paginator_children = getPaginatorChildren();
      }
    });
  };
})( jQuery );
