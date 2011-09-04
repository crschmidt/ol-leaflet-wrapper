This project is a quick demonstration of how it is possible to make OpenLayers
behave like other libraries, by simply wrapping OpenLayers in a slightly
different UI.

The quick-start.html page is now completed other than support for popups.
There is one minor change to the quick-start page; instead of using:

   map.setView().addLayer();

The code instead uses:

   map.addLayer().setView();
