// Initialize your app
var myApp = new Framework7({
    animateNavBackIcon: true,
    // Enable templates auto precompilation
    precompileTemplates: true,
    // Enabled pages rendering using Template7
	swipeBackPage: false,
	swipeBackPageThreshold: 1,
	swipePanel: "left",
	sortable: false,
	swipePanelCloseOpposite: true,
	pushState: false,
    template7Pages: true,
	modalTitle: 'Maria Gata',
	modalButtonOk: 'Ok',
	modalButtonCancel: 'Cancelar',
	//smartSelectSearchbar: true,
	//smartSelectInPopup: true,
	hideTabbarOnPageScroll: true
});


// Export selectors engine
var $$ = Dom7;

// Add main View
var mainView = myApp.addView('.view-main', {
    // Enable dynamic Navbar
    dynamicNavbar: false
});
