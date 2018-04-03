({
    getMyFunds : function(component) {
        var action = component.get("c.getMyRecentMutualFunds");
        action.setCallback(this, function(response) {
            var state = response.getState();
            console.log('State..'+state);
            if (state === "SUCCESS") {
                console.log('Result..'+JSON.stringify(response.getReturnValue()));
                component.set("v.myFunds",response.getReturnValue());
            }
        });
        $A.enqueueAction(action);
    }
})