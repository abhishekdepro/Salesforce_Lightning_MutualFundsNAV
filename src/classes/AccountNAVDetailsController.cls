public class AccountNAVDetailsController {
    public static List<String> fundPortfolios;
    
    /* Method description: Fetch the recent NAV details, etc. for all my watched funds
     * @params: void
     * @return: List<Mutual_Fund__c> - List of custom object Mutual Funds
	*/
    @AuraEnabled
    public static List<Mutual_Fund__c> getMyRecentMutualFunds(){
        Map<String,Mutual_Fund__c> myFundMap = new Map<String,Mutual_Fund__c>();
        
        //get your watched/invested MF portfolios
        fundPortfolios = getMyPortfolios();
        
        for(Mutual_Fund__c mFund: [SELECT Name,Type__c,NAV__c,Portfolio_Name__c,Percentage_Change__c  FROM Mutual_Fund__c WHERE Portfolio_Name__c IN:fundPortfolios ORDER BY CreatedDate DESC LIMIT 2]){
            if(!myFundMap.containsKey(mFund.Portfolio_Name__c))
                myFundMap.put(mFund.Portfolio_Name__c, mFund);
        }
        
        return myFundMap.values();
    }
    
    /* Method description: Get the Scheme Name/Portfolio Name for my watched funds Custom Metadata Type
     * @params: void
     * @return: List<String> - List of watched mutual fund names
	*/
    public static List<String> getMyPortfolios(){
        List<String> myPortfolios = new List<String>();
        List<Invested_Funds__mdt> configurableFunds = [SELECT MasterLabel,Scheme_Name__c,Portfolio_Name__c FROM Invested_Funds__mdt];
        
        if(configurableFunds!=null){
            for(Invested_Funds__mdt fund: configurableFunds){
                myPortfolios.add(fund.Portfolio_Name__c);
            }
        }
        
        return myPortfolios;
    }
}