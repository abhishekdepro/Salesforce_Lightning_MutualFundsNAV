({
    getMyFunds : function(component) {
        var action = component.get("c.getMyRecentMutualFunds");
        action.setCallback(this, function(response) {
            var state = response.getState();
            console.log('State..'+state);
            if (state === "SUCCESS") {
                console.log('Result..'+JSON.stringify(response.getReturnValue()));
                component.set("v.myFunds",response.getReturnValue());
                var myFunds = component.get("v.myFunds");
                for(var i=0;i<myFunds.length;i++){
                    if(myFunds[i].Percentage_Change__c<0){
                    	myFunds[i].isNegative__c = true; 
                    }else{
                     	myFunds[i].isNegative__c = false;    
                    } 
                }
                component.set("v.myFunds",myFunds);
                console.log('myFunds...'+JSON.stringify(myFunds));
            }
        });
        $A.enqueueAction(action);
    }
})