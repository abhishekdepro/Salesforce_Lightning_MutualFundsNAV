({
	doInit : function(component, event, helper) {
    	// get the latest NAV Values for all your funds
    	helper.getMyFunds(component);
	},
    
    refreshFunds : function(component, event, helper) {
    	// get the latest NAV Values for all your funds on Button click
    	helper.getMyFunds(component);
	}
})