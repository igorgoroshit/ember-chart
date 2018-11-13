define("ember-chartjs/templates/components/ember-chart", ["exports", "ember"], function (exports, _ember) {
  "use strict";

  exports["default"] = _ember["default"].HTMLBars.template((function () {
    return {
      meta: {
        "revision": "Ember@1.13.11",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 5,
            "column": 0
          }
        }
      },
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("button");
        dom.setAttribute(el1, "class", "chart-back");
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("canvas");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var element0 = dom.childAt(fragment, [1]);
        var element1 = dom.childAt(fragment, [3]);
        var morphs = new Array(6);
        morphs[0] = dom.createAttrMorph(element0, 'style');
        morphs[1] = dom.createElementMorph(element0);
        morphs[2] = dom.createMorphAt(element0, 0, 0);
        morphs[3] = dom.createAttrMorph(element1, 'id');
        morphs[4] = dom.createAttrMorph(element1, 'width');
        morphs[5] = dom.createAttrMorph(element1, 'height');
        return morphs;
      },
      statements: [["attribute", "style", ["get", "buttonDisplay", ["loc", [null, [2, 35], [2, 48]]]]], ["element", "action", ["backAction"], ["bubbles", false], ["loc", [null, [2, 51], [2, 88]]]], ["content", "backText", ["loc", [null, [2, 89], [2, 101]]]], ["attribute", "id", ["concat", [["get", "id", ["loc", [null, [4, 14], [4, 16]]]]]]], ["attribute", "width", ["concat", [["get", "width", ["loc", [null, [4, 29], [4, 34]]]]]]], ["attribute", "height", ["concat", [["get", "height", ["loc", [null, [4, 48], [4, 54]]]]]]]],
      locals: [],
      templates: []
    };
  })());
});