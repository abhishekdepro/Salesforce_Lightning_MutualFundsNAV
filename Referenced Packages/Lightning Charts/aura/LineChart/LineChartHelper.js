({
    generateUniqueId: function(component) {
        var globalId = component.getGlobalId();
        globalId = globalId.replace(";", "X");
        globalId = globalId.replace(".", "A");
        globalId = globalId.replace(":", "B");
        globalId = "dm" + globalId;
		return globalId;
    },

    //helper method invoked during the component rendering lifecycle
    //used to retrieve data from the server side and initialize requirejs
    //to load apporpriate scripts
    initScripts: function(component) {        
		//fetch the data from server side only if it is not already fetched        
      	this.fetchDataFromSource(component);
  	},

    fetchDataFromSource: function(component) {
        //based on the datasource fetch information from the appropriate source
        //datasources supported are "APEX PROVIDER", "REST SERVICE", "CLIENT"
        var dataSourceType = component.get("v.dataSourceType");

	    //This attribute needs to be populated if APEX Provider is selected as the data source Type
        var apexProviderClass = component.get("v.apexProviderClass");

    	//This attribute needs to be populated if REST Service is selected as the data source Type
        var restEndPoint = component.get("v.restEndPoint");
        var restEndPointMethod = component.get("v.restEndPointMethod");
        var accessToken = component.get("v.accessToken");
        
       	//call the server side APEX Controller Method to retrieve the values
        var action = component.get("c.getChartData");
        action.setParams({'dataSourceType': dataSourceType, 'apexProviderClass': apexProviderClass, 'restEndPoint': restEndPoint, 'restEndPointMethod': restEndPointMethod, 'authorizationToken': accessToken});   
        action.setCallback(this, function(a) {
        	//populate the values retrieved from the server side using the callback method
            var jsonData = a.getReturnValue();    
            
            if (dataSourceType == "CLIENT") {
	        	jsonData = component.get("v.data");
                if ((typeof jsonData == "undefined") || (jsonData == "")) {
                    jsonData = '[]';
                }                
 		   	}
            this.initRequireJS(component, jsonData, dataSourceType);
     	});      
        $A.enqueueAction(action);
    },
    
    initRequireJS : function(component, jsonData, dataSourceType) {
		// Use $j rather than $ to avoid jQuery conflicts
        if (typeof jQuery !== "undefined" && typeof $j === "undefined") {
        	$j = jQuery.noConflict(true);
      	}
                    
        if (typeof $j != "undefined") {
        	//self.validateAttributes(component);
            //call the method to convert the regular HTML Input element into
            //a Kendo UI Control and pass the relevant data for initialization
        	this.createChart(jsonData, component, dataSourceType);
       	}   
    },
    
    validateAttributes: function(component) {
        //helper method to validate all required attributes for the Component
        //are passed and valid
        var cLocalId = component.getLocalId();
        if ((typeof cLocalId === "undefined") || (cLocalId == "")) {
            var errorMessage = "Pick List Component cannot be loaded without a valid value for the aura:id attribute";
			var errorTitle = "Invalid Component Configuration";
            //helper.displayErrorMessage(component, errorTitle, errorMessage);
            $A.error(errorMessage);
        }
    },

    createChart : function(jsonData, component, dataSourceType) {
	     //method to convert the HTML Control into a Kendo UI Control
		var isFieldVisible =  "none";
        var wrapperDivElementId = this.getWrapperElementId(component);
	    //don't display the Control until all the data is populated. This is controlled
        //by setting the display flag on the container div
        isFieldVisible = $j("#" + wrapperDivElementId).css('display');
	    var jsData = this.parseDataFromDataSource(component, dataSourceType, jsonData);
		//convert the Div element into a Chart            
	    this.displayChart(component, jsData);
        
		var isChartVisible = component.get("v.enabled");
        //display the DIV element containing the Kendo UI Control
        if (isChartVisible)
            $j("#" + wrapperDivElementId).show();  
   	},
    
    parseDataFromDataSource: function(component, dataSourceType, jsonData) {
        var jsData = "";
        //parse the JSON data passed to this function and populate
        if (dataSourceType != "CLIENT") {
        	var dataResult = $j.parseJSON(jsonData);
            //if there are any errors in data retrieval throw 
            if (dataResult.status == false) {
            	var errorMessage = dataResult.message;
                $A.error(errorMessage);
            }
            if (dataResult.status == true) {  
            	jsData = dataResult.data;
            }
      	}
        else {
        	jsData = jsonData;         
      	}
        return jsData;
    },
    
   	displayChart: function(component, jsData) {
        if (jsData != "") {
        	var chartData = "[";
            //loop through all the data passed    
            $j.each($j.parseJSON(jsData), function() {
            	var chartDataItem = "{";    
                chartDataItem += "\"name\": \"" + this.name + "\",";
                chartDataItem += "\"data\": " + this.data;
                chartDataItem += "}";
                if (chartData != "[") {
                	chartData += ",";
                }
                chartData += chartDataItem;
         	});
    		chartData += "]";
                
            var chartTitle = component.get("v.chartTitle");
            var uiControlId = this.getUIControlId(component);
            
            var chartWidth = component.get("v.displayWidth");
            var chartHeight = component.get("v.displayHeight");
             
            
			//$j("#" + uiControlId).css("background", "center no-repeat url('" + component.get("v.backgroundImageUrl") + "')");   
            $j("#" + uiControlId).kendoChart({
            	title: {
                	text: chartTitle
               	},
                legend: {
                	position: "top"
               	},
                chartArea: {
	                    height: parseInt(chartHeight),
                        width:parseInt(chartWidth)
          			} , 
                seriesDefaults: {
                    type: "line",
                    style: "smooth"
                },
                series: $j.parseJSON(chartData)
                ,
                valueAxis: {
                    labels: {
                        format: "{0}%"
                    },
                    line: {
                        visible: false
                    },
                    axisCrossingValue: -10
                },
                categoryAxis: {
                    categories: $j.parseJSON(component.get("v.xAxisLabels")),
                    majorGridLines: {
                        visible: false
                    }
                },
                tooltip: {
                    visible: true,
                    format: "{0}%",
                    template: "#= series.name #: #= value #"
                }
            });    
        }
    },
            
    //helper method to retrieve the unique control id
    getDocMId: function(component) {
		return component.get("v.docmId");        
    },
   
    //helper method to retrieve the unique control id
    getUIControlId: function(component) {
		return component.get("v.uiElement") + component.get("v.docmId");        
    },

    //helper method to retrieve the unique control id
    getWrapperElementId: function(component) {
		return component.get("v.wrapperDivElement") + component.get("v.docmId");        
    },

    //helper method to retrieve the unique control id
    getMessageElementId: function(component) {
		return component.get("v.messageDivElement") + component.get("v.docmId");        
    },

	//helper method to Refresh the Pick List values pulled
	//from the server side    
  	refreshUI : function(component) {
        console.log("LineChart: refreshUI: enter");
       	var controlId = this.getUIControlId(component);
        //this.enableComponent(component);
        //var uiControl = $j("#" + controlId).data("kendoChart");
        //uiControl.refresh();
    },
    
})