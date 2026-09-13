/*
 * Client-side table of contents for article pages.
 *
 * Loaded with `defer` from _layouts/post.html, so it runs after the document
 * has been parsed but before DOMContentLoaded listeners registered inline; the
 * DOMContentLoaded guard below keeps it correct either way.
 *
 * Contract with the layout and the stylesheet:
 *   - The layout ships an empty `<aside class="toc-aside" hidden>` between
 *     `.post-header` and `.post-content`. This script fills it and drops the
 *     `hidden` attribute; if there are fewer than three headings it leaves the
 *     aside untouched, so nothing renders.
 *   - Exactly one markup shape is produced for both breakpoints:
 *       <nav class="toc"><details class="toc-details">
 *         <summary class="toc-title">目录</summary><ol>…</ol>
 *       </details></nav>
 *     `assets/main.scss` presents it as a sticky right-margin rail at
 *     >= 1180px and as a collapsible block above the article below that.
 *     The `open` attribute is driven from here (always open on wide, closed by
 *     default on narrow) because `<details>` visibility cannot be forced from
 *     CSS alone.
 *
 * No dependencies, no modules, ES5-compatible.
 */
(function () {
  'use strict';

  var WIDE_QUERY = '(min-width: 1180px)';
  var HEADING_SELECTOR = 'h2, h3';
  // Keep in sync with the IntersectionObserver rootMargin below: a heading
  // counts as "current" once its top edge is within the upper 30% of the
  // viewport.
  var ACTIVE_BAND = 0.3;

  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  /* Heading text, with MathJax's accessibility mirror and any scripts pruned.
   * MathJax 3 is loaded async, so most of the time it has not run yet and the
   * clone is already plain text; this keeps the label correct if it has. */
  function headingText(heading) {
    var clone = heading.cloneNode(true);
    var junk = clone.querySelectorAll('mjx-assistive-mml, script, style');
    for (var i = 0; i < junk.length; i++) {
      junk[i].parentNode.removeChild(junk[i]);
    }
    return (clone.textContent || '').replace(/\s+/g, ' ').replace(/^ | $/g, '');
  }

  /* Only used when kramdown did not emit an id (it normally does, including
   * for pure-Chinese headings). Existing ids are always kept as-is. */
  function slugify(text) {
    var slug = text
      .toLowerCase()
      .replace(/[\s　]+/g, '-')
      .replace(/[^\wÀ-￿-]/g, '')
      .replace(/^-+|-+$/g, '');
    return slug || 'section';
  }

  function ensureId(heading, used) {
    var id = heading.id;
    if (!id) {
      var base = slugify(headingText(heading));
      id = base;
      var n = 1;
      while (used[id] || document.getElementById(id)) {
        id = base + '-' + n;
        n++;
      }
      heading.id = id;
    }
    used[id] = true;
    return id;
  }

  function collectHeadings(root) {
    var all = root.querySelectorAll(HEADING_SELECTOR);
    var out = [];
    for (var i = 0; i < all.length; i++) {
      var h = all[i];
      // Skip headings that are quoted material or live inside a table.
      if (h.closest && h.closest('blockquote, table, figure')) {
        continue;
      }
      if (!headingText(h)) {
        continue;
      }
      out.push(h);
    }
    return out;
  }

  function buildList(headings, used) {
    var rootList = document.createElement('ol');
    var currentSubList = null;
    var links = [];

    for (var i = 0; i < headings.length; i++) {
      var heading = headings[i];
      var level = heading.tagName.toLowerCase();
      var id = ensureId(heading, used);

      var li = document.createElement('li');
      li.className = 'toc-item toc-item-' + level;

      var a = document.createElement('a');
      a.className = 'toc-link';
      a.href = '#' + id;
      a.textContent = headingText(heading);
      li.appendChild(a);

      links.push({ id: id, heading: heading, link: a });

      if (level === 'h3' && currentSubList) {
        currentSubList.appendChild(li);
      } else {
        rootList.appendChild(li);
        if (level === 'h2') {
          // Created eagerly, pruned below if this h2 has no h3 children.
          currentSubList = document.createElement('ol');
          currentSubList.className = 'toc-sublist';
          li.appendChild(currentSubList);
        } else {
          // An h3 before any h2 sits at top level and cannot host children.
          currentSubList = null;
        }
      }
    }

    // Drop the sublists that stayed empty.
    var empties = rootList.querySelectorAll('.toc-sublist');
    for (var j = 0; j < empties.length; j++) {
      if (!empties[j].children.length) {
        empties[j].parentNode.removeChild(empties[j]);
      }
    }

    return { list: rootList, links: links };
  }

  function setupResponsiveOpenState(details) {
    if (!window.matchMedia) {
      details.open = true;
      return;
    }
    var mql = window.matchMedia(WIDE_QUERY);
    var last = null;
    // Only ever writes `open` when the breakpoint actually changes, so a reader
    // who collapsed the block on a narrow screen keeps it collapsed.
    var apply = function (matches) {
      matches = !!matches;
      if (matches === last) { return; }
      last = matches;
      details.open = matches;
    };
    apply(mql.matches);
    if (mql.addEventListener) {
      mql.addEventListener('change', function (e) { apply(e.matches); });
    } else if (mql.addListener) {
      mql.addListener(function (e) { apply(e.matches); });
    }
    // Re-check after layout settles: in a frame that has not been laid out yet
    // (an iframe created and filled in the same task) matchMedia can answer
    // from a zero-width viewport, and no `change` event follows the first
    // layout. Both re-checks are no-ops once the answer is stable.
    var recheck = function () { apply(mql.matches); };
    window.addEventListener('resize', recheck);
    window.addEventListener('load', recheck);
    if (window.requestAnimationFrame) {
      window.requestAnimationFrame(recheck);
    }
  }

  function setupScrollSpy(entries) {
    var active = null;

    function setActive(entry) {
      if (active === entry) { return; }
      if (active) { active.link.classList.remove('is-active'); }
      active = entry;
      if (active) { active.link.classList.add('is-active'); }
    }

    /* Deterministic pick: the last heading whose top edge has crossed the
     * activation band. Observers only tell us *when* to recompute; recomputing
     * from geometry avoids the ordering ambiguity of intersection callbacks and
     * handles the bottom of the page correctly. */
    function update() {
      var boundary = window.innerHeight * ACTIVE_BAND;
      var pick = null;
      for (var i = 0; i < entries.length; i++) {
        if (entries[i].heading.getBoundingClientRect().top <= boundary) {
          pick = entries[i];
        } else {
          break;
        }
      }
      // Above the first heading: keep the first item lit so the rail is never
      // blank; at the very bottom, light the last section.
      if (!pick) {
        pick = entries[0];
      }
      var atBottom = window.innerHeight + window.pageYOffset >=
        document.documentElement.scrollHeight - 2;
      if (atBottom) {
        pick = entries[entries.length - 1];
      }
      setActive(pick);
    }

    var queued = false;
    function schedule() {
      if (queued) { return; }
      queued = true;
      var run = function () { queued = false; update(); };
      if (window.requestAnimationFrame) {
        window.requestAnimationFrame(run);
      } else {
        setTimeout(run, 60);
      }
    }

    if ('IntersectionObserver' in window) {
      var observer = new IntersectionObserver(schedule, {
        rootMargin: '0px 0px -70% 0px',
        threshold: 0
      });
      for (var i = 0; i < entries.length; i++) {
        observer.observe(entries[i].heading);
      }
    }
    // Also on scroll/resize: IntersectionObserver fires only at band crossings,
    // so on its own it goes quiet inside a long section and after a hash jump.
    // This is the graceful fallback when IntersectionObserver is missing too.
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);

    // Clicking a link: let the browser do the navigation and the hash update,
    // but light the target immediately rather than waiting for the scroll.
    for (var k = 0; k < entries.length; k++) {
      (function (entry) {
        entry.link.addEventListener('click', function () {
          setActive(entry);
        });
      })(entries[k]);
    }

    update();
  }

  ready(function () {
    var aside = document.querySelector('.toc-aside');
    var content = document.querySelector('.post-content');
    if (!aside || !content) { return; }

    var headings = collectHeadings(content);
    if (headings.length < 3) { return; }

    var used = {};
    var built = buildList(headings, used);

    var nav = document.createElement('nav');
    nav.className = 'toc';
    nav.setAttribute('aria-label', '目录');

    var details = document.createElement('details');
    details.className = 'toc-details';

    var summary = document.createElement('summary');
    summary.className = 'toc-title';
    summary.textContent = '目录';

    details.appendChild(summary);
    details.appendChild(built.list);
    nav.appendChild(details);
    aside.appendChild(nav);
    aside.removeAttribute('hidden');

    setupResponsiveOpenState(details);
    setupScrollSpy(built.links);
  });
})();
