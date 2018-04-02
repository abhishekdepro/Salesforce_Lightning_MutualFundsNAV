({
    
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
            var bIsIPhone = this.isIPhone();
            var bIsMobile = this.isMobile();
            
            var uiWidth = component.get("v.displayWidth");
            if (uiWidth.toLowerCase().indexOf("px") > 0) {
                var iUiWidth = uiWidth.substring(0, uiWidth.toLowerCase().indexOf("px"));
               if (parseInt(iUiWidth) < 400) {
                    bIsIPhone = true;
                }
            }
            
            var bDisplaySeriesLabels = true;
            var displayLegend = "default";
            if (bIsIPhone || bIsMobile) {
                bDisplaySeriesLabels = false;
                displayLegend = "Custom";
            }
            var categoryCount = 0;

            var chartData = "[";
            //loop through all the data passed    
          	$j.each($j.parseJSON(jsData), function() {
            	var chartDataItem = "{";    
                chartDataItem += "\"category\": \"" + this.category + "\",";
                chartDataItem += "\"value\": \"" + this.value + "\",";
                chartDataItem += "\"color\": \"" + this.color + "\"";
                chartDataItem += "}";
                if (chartData != "[") {
                	chartData += ",";
                }
                chartData += chartDataItem;
                categoryCount += 1;
         	});
    		chartData += "]";
            
            var xOffsetForLegend = -150;
            if (categoryCount > 3) 
                xOffsetForLegend = -80;
                
            if (categoryCount > 6) 
                xOffsetForLegend = 0;

    

            var chartTitle = component.get("v.chartTitle");
            var uiControlId = this.getUIControlId(component);
            var displaySeriesLabel = component.get("v.displaySeriesLabels");
            var hasSeriesLabel = false;
            
            var chartWidth = component.get("v.displayWidth");
            var chartHeight = component.get("v.displayHeight");
                        
            
            if (displaySeriesLabel.toUpperCase() == "YES")
                hasSeriesLabel = true;
            
            if (hasSeriesLabel) {            

            
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
                    labels: {
                        visible: true,
                        background: "transparent",
                        color:"white",
                        format: "N0"
                    },
                    dynamicSlope: false,
                    dynamicHeight: false
                },
                series: [{
                    type: "funnel",
                    data: $j.parseJSON(chartData)
                }],
                tooltip: {
                    visible: true,
                    template: "#= category #"
                }
            });    
            }
                else {
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
                    labels: {
                        visible: true,
                        background: "transparent",
                        color:"white",
                        format: "N0"
                    },
                    dynamicSlope: false,
                    dynamicHeight: false
                },
                series: [{
                    type: "funnel",
                    data: $j.parseJSON(chartData)
                }],
                tooltip: {
                    visible: true,
                    template: "#= category #"
                }
            });    
                    
                }
        }
    },

    isMobile: function() {
        var device = $A.get("$Browser.formFactor");
        if (device == "PHONE") 
            return true;
        else
            return false;
    },
            
    isIPhone: function() {
        var device = $A.get("$Browser.isIPhone");
        if (device == true) 
            return true;
        else
            return false;
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
        console.log("FunnelChart: refreshUI: enter");
       	var controlId = this.getUIControlId(component);
        //this.enableComponent(component);
        //var uiControl = $j("#" + controlId).data("kendoChart");
        //uiControl.refresh();
    },
    
    generateUniqueId: function(component) {
        var globalId = component.getGlobalId();
        globalId = globalId.replace(";", "X");
        globalId = globalId.replace(".", "A");
        globalId = globalId.replace(":", "B");
        globalId = "dm" + globalId;
		return globalId;
    },
    
})