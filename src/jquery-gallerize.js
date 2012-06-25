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
      paginator: false,
    }, options);

    return this.each(function() {
      var $this = $(this);

      var currentSlide = 0;
      var maxHeight;
      var increment = $this.width();

      var $gallery_window;
      var $children;

      var $paginator;
      var $paginator_children;
      var paginator_increment;
      var currentPaginatorSlide;
      var maxVisibleThumbs;
      
      var init = function () {
        $gallery_window = $("<div class='gallery_window' />").css({'overflow': 'hidden', 'width': increment, 'outline': '1px solid green'});

        $children = $this.children(settings.items);
        if (settings.items === "") {
          settings.items = $children.get(0).tagName.toLowerCase();
        }
        $this.wrap($gallery_window);
        setupGallery();
        setupPaginator();
        bindListeners();
        
      }

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
          $this.parents('.gallery_window').find(settings.next_button).bind('click.gallerize', function () {
            moveRight();
          });
        }
        if (settings.prev_button !== false) {
          $this.parents('.gallery_window').find(settings.prev_button).bind('click.gallerize', function () {
            moveLeft();
          });
        }
        $(document).bind('keydown.gallerize', function (e) {
          if (e.keyCode === 37) { moveLeft(); }
          if (e.keyCode === 39) { moveRight(); }
        });
      }

      var setupPaginator = function () {
        $pag = $("<ul class='paginator' />");        
        $children.each(function (i, el) {
          var $el = $(el);
          $el.data('index', i);
          if ($el.data('thumb_src') != undefined) {
            $pag.append("<li data-index='" + i + "'><img src='" + $(el).data('thumb_src') + "'></li>");
          }
        });

        $pag.bind('click.gallerize', function (e) {
          $li = $(e.target).parents(settings.items);
          if ($li.length != 1) { return; }
          moveToSlide($li.data('index'));
          movePaginatorToSlide($li.data('index'));
          e.preventDefault();
        });

        $children.parents('.gallery_window').append($pag);
        $paginator_children = $pag.children();
        
        paginator_increment = $paginator_children.outerWidth(true);
        $pag.css('width' , $paginator_children.length * paginator_increment);

        $paginator = $("ul.paginator");
        
        $paginator_left = $("<a href='javascript://' class='paginatorLeft' />").bind('click.gallerize', function () { movePaginatorLeft(); });
        $paginator_right = $("<a href='javascript://' class='paginatorRight' />").bind('click.gallerize', function () { movePaginatorRight(); });
        $(".gallery_window").css('position', 'relative').append($paginator_left).append($paginator_right);
        
        $paginator.css('margin-left', $paginator_left.outerWidth(true));
        
        maxVisibleThumbs = (increment - (2 * $paginator_left.outerWidth(true))) / paginator_increment;
        maxVisibleThumbs = Math.floor(maxVisibleThumbs)

        
      }

      var movePaginatorToSlide = function (index) {
        currentPaginatorSlide = index;
        $paginator.animate({'margin-left': -((index * paginator_increment) - $paginator_left.outerWidth(true) )}, settings.transition_duration);
      }
      var movePaginatorRight = function () {
        if (currentPaginatorSlide >= ($children.length - 1)) {
          return;
        }
        movePaginatorToSlide(currentPaginatorSlide + maxVisibleThumbs);
      };
      var movePaginatorLeft = function () {
        if (currentPaginatorSlide <= 0) {
          return;
        }
        movePaginatorToSlide(currentPaginatorSlide - maxVisibleThumbs );
      };
      
      var getPaginatorChildren = function () {
        return $this.parents(".gallery_window").find(settings.paginator_class).children();
      }
      
      var setupGallery = function() {
        switch (settings.transitionFx)
        {
          case 'fade':
            $this.css('width', increment);
            $children.css({'display': 'none', 'float': 'left', 'width': increment});
            moveToSlide(0);
            break;
          case 'slide':
            $this.css('width', $children.length * increment);
            $children.css({'float': 'left', 'width': increment});
            moveToSlide(0);
            break;
          case 'noFx':
            $this.css('width', increment);
            $children.css({'display': 'none', 'float': 'left', 'width' : increment});
            moveToSlide(0);
            break;
          default:
            document.write('<br>Efeito invalido!');
            break;
        }
      }
      var moveToSlide = function (index) {
        index = parseInt(index, 10);
        if (index < 0 || index > $children.length) { return false; }
        
        $($children.removeClass(settings.active_slide_class).get(index)).addClass(settings.active_slide_class);
        if ($paginator_children !== undefined) {
          $($paginator_children.removeClass(settings.active_paginator_class).get(index)).addClass(settings.active_paginator_class);
        }
        switch (settings.transitionFx) {
          case 'fade':
             $children.stop(true, false).fadeOut(settings.transition_duration / 2);
             setTimeout(function () { $($children.get(index)).stop(true, true).fadeIn(settings.transition_duration / 2) }, ((settings.transition_duration / 2) + 10));
             break;
          case 'slide':
            var newLeft = -(index * increment);
            $this.stop(true, false).animate({'margin-left': newLeft}, settings.transition_duration, function () {
              currentSlide = index;
            });
            break;
          case 'noFx':
            $children.css('display', 'none');
            $children.filter('.active').css('display', 'block');
            break;
        }
      };
      var moveRight = function () {
        if (currentSlide >= ($children.length - 1)) {
          return;
        }
        moveToSlide(++currentSlide);
      };
      var moveLeft = function () {
        if (currentSlide <= 0) {
          return;
        }
        moveToSlide(--currentSlide);
      };
      
      init();
      
      if (settings.paginator !== false) {
        settings.paginator();
        $paginator_children = getPaginatorChildren();
      }
      
    });
  };
})( jQuery );
