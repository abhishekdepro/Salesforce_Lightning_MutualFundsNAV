###########################################################
# Simple Script to fetch NAV Details and push to Salesforce
# Author: Abhishek Dey
# Version: 1.0
# Date: 03-Apr-2018
###########################################################

from simple_salesforce import Salesforce
import urllib
import config
import datetime

#Method to Delete MF from Dictionary if the values have not changed overnight
def pop_unchanged_funds(fundname,oldNAV,createdDate):
    today = datetime.date.today()
    today = today.strftime('%Y-%m-%d')
    if (float(oldNAV) == float(mutual_fund_NAVDict[fundname]) and today==createdDate[:10]):
            print 'success!'
            del mutual_fund_NAVDict[fundname]

urllib.urlretrieve('https://www.amfiindia.com/spages/NAVAll.txt', 'NAVAll.txt')
mutual_fund_NAVDict = {}
with open("NAVAll.txt") as f:
    for line in f:
        if "Axis Long Term Equity Fund - Growth" in line:
             mutual_fund_NAVDict['Axis Long Term Equity Fund'] = line.split(';')[4]
        if "Aditya Birla Sun Life Tax Relief '96 - Growth Option" in line:
             mutual_fund_NAVDict["Aditya Birla Sun Life Tax Relief '96 - Growth"] = line.split(';')[4]

print mutual_fund_NAVDict

sf = Salesforce(username=config.SALESFORCE_CONFIG.get('username'), password=config.SALESFORCE_CONFIG.get('password'), security_token=config.SALESFORCE_CONFIG.get('security_token'))
query_results = sf.query("SELECT Id, Portfolio_Name__c, NAV__c, CreatedDate FROM Mutual_Fund__c ORDER BY CreatedDate DESC LIMIT 2")

#iterate over the fetched records and see if NAV has changed
mf_records = query_results['records']
for mf in mf_records:
    pop_unchanged_funds(mf['Portfolio_Name__c'],mf['NAV__c'],mf['CreatedDate'])

print mutual_fund_NAVDict

for fund in mutual_fund_NAVDict.keys():
    sf.Mutual_Fund__c.create({'Type__c':'ELSS','NAV__c': mutual_fund_NAVDict.get(fund),
                          'Portfolio_Name__c':fund})
