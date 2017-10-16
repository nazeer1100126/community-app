(function (module) {
    mifosX.controllers = _.extend(module, {
        SearchDetailsController: function (scope, resourceFactory, location, routeParams, dateFilter, routeParams) {
            scope.offices = [];
            scope.formData = {};
            scope.resource = "clientIdentifiers,clients,loans,savings";
            scope.clientDatas = {};
            scope.loanResults = [];
            scope.savingResults = [];
            scope.searchView = "SEARCH";  
            scope.savingView = "SAVING";  
            scope.loanView = "LOAN";
            scope.clientEntityType = 'CLIENT';
            scope.clientIdentifierEntityType = 'CLIENTIDENTIFIER';
            scope.view = scope.searchView;
            scope.savingaccountdetails = {};
            scope.currentUserId = null;
            scope.interBranchWithdrawalCode = 'savingsAccountTransactionType.interBranchWithdrawal';
            scope.fundTransferView = "fundTransfer";
            scope.savingAccountType = 2;
            scope.loanAccountType = 1;
            scope.toAccounts = [];
            scope.transferData = {};


            if(scope.$parent.currentSession != undefined && scope.$parent.currentSession.user != undefined){
                scope.currentUserId = scope.$parent.currentSession.user.userId
            }

            scope.checkView = function(){
                if(location.search().isInterBranchSearch != undefined && location.search().isInterBranchSearch== 'true'){
                    scope.formData.officeId = location.search().officeId ;
                    scope.formData.searchText = location.search().searchText ;
                    scope.getDetails();
                    if(location.search().loanId != undefined){
                        scope.view = scope.loanView;
                        scope.getAccount(location.search().loanId,scope.loanView);
                    }else if(location.search().savingId != undefined){
                         scope.view = scope.savingView;
                        scope.getAccount(location.search().savingId,scope.savingView);
                    }
                 }
            }; 

            scope.getAllOffices = function(){
            	resourceFactory.officeResource.getAllOffices({includeAllOffices:true},{}, function (data) {
	            	scope.offices = data;
	            	scope.formData.officeId = data[0].id;
	            	scope.checkView();
	            });
            };  

            scope.getDetails = function(){
            	resourceFactory.globalSearch.search({query:scope.formData.searchText,resource : scope.resource, officeId: scope.formData.officeId,isInterBranchSearch:true},{}, function (data) {
	            	scope.constructData(data);
	            });
            };

            scope.getAllOffices(); 

            scope.constructData = function(data){
	            scope.loanResults = [];
	            scope.savingResults = [];
                scope.clientDatas = [];
                scope.loans = [];
                scope.savings = [];
                scope.clientIdentifierDatas = [];
            	for(var i in data){
            		if(data[i].entityType == scope.clientEntityType){
            			scope.clientDatas[data[i].entityId] = data[i];
	            	}else if(data[i].entityType == scope.loanView){          		
                        scope.loans[data[i].entityId] = data[i];
	            	}else if(data[i].entityType == scope.savingView){  
                    scope.savings[data[i].entityId] = data[i]; 
	            	}else if(data[i].entityType == scope.clientIdentifierEntityType){  
                    scope.clientIdentifierDatas[data[i].entityId] = data[i]; 
                    }
            	}
            	if(!_.isEmpty(scope.clientDatas)){
            		scope.constructClientLoanData(scope.clientDatas);
            	}
                if(!_.isEmpty(scope.loans)){
                    scope.constructLoanData(scope.loans);
                }
                if(!_.isEmpty(scope.savings)){
                    scope.constructSavingData(scope.savings);
                }
                if(!_.isEmpty(scope.clientIdentifierDatas)){
                    scope.constructFromClientIdentifierData(scope.clientIdentifierDatas);
                }
            	
            };

            scope.constructLoanData = function(data){
                for(var key in data){
                    var val = data[key];
                    if(data.hasOwnProperty(key)){
                        scope.getLoanAccount(val);
                    }
                    
                }
            };

            scope.constructFromClientIdentifierData = function(data){
                for(var key in data){
                    var val = data[key];
                    if(data.hasOwnProperty(key)){
                        scope.getClientLoanAndSavingAccount(val,scope.clientIdentifierEntityType);
                    }
                    
                }
            };

            scope.getLoanAccount = function(data){
                resourceFactory.interBranchLoanAccountResource.get({loanId: data.entityId}, function (loan) {
                            var loandata = {'id' : data.entityId,'clientName':data.parentName,'type':scope.loanView,'accountNo' : data.entityAccountNo,
                            'status':data.entityStatus,'clientId': data.parentId,'clientOfficeName':loan.clientOfficeName,'clientAccountNumber':loan.clientAccountNo};
                            scope.loanResults.push(loandata);
                         });
            };

            scope.constructSavingData = function(data){
                for(var key in data){
                    var val = data[key];
                    if(data.hasOwnProperty(key)){
                        scope.getSavingAccount(val);
                    }
                    
                }
            };

            scope.getSavingAccount = function(data){
                        resourceFactory.interBranchSavingAccountResource.get({accountId: data.entityId}, function (saving) {
                            var savingData = {'id' : data.entityId,'clientName':data.parentName,'type':scope.savingView,'accountNo' : data.entityAccountNo,'status':data.entityStatus,'clientId': data.parentId};
                            savingData.clientOfficeName = saving.officeName;
                            savingData.clientAccountNumber = saving.clientAccountNumber;                            
                            scope.savingResults.push(savingData);
                        });
            };

            scope.constructClientLoanData = function(data){
            	for(var key in data){
            		var val = data[key];
            		if(data.hasOwnProperty(key)){
            			scope.getClientLoanAndSavingAccount(val, scope.clientEntityType);
            		}
            		
            	}
            };


            scope.getClientLoanAndSavingAccount = function(data, type){
                var id = '';
                if(type==scope.clientEntityType){
                    id = data.entityId;
                }else{
                    id = data.parentId;
                }
                resourceFactory.interBranchClientsResource.get({clientId: id}, function (clientData) {
                    var clientsData = {'clientId': clientData.id,'clientName': clientData.displayName ,'clientAccountNumber': clientData.accountNo,'clientOfficeName': clientData.officeName};
                    resourceFactory.interBranchClientAccountResource.get({},{clientId: id}, function (clientAccountData) {
                        if(clientAccountData.loanAccounts != undefined && clientAccountData.loanAccounts.length>0){
                            for(var i in clientAccountData.loanAccounts){
                                var loandata = {'id' : clientAccountData.loanAccounts[i].id, 'type':scope.loanView,'accountNo' : clientAccountData.loanAccounts[i].accountNo,
                                'status':clientAccountData.loanAccounts[i].status};
                                angular.extend(loandata, clientsData);
                                scope.loanResults.push(loandata);
                            }                               
                        }
                        if(clientAccountData.savingsAccounts != undefined && clientAccountData.savingsAccounts.length>0){
                            for(var i in clientAccountData.savingsAccounts){
                                var savingsdata = {'id' : clientAccountData.savingsAccounts[i].id,'type':scope.savingView,'accountNo' : clientAccountData.savingsAccounts[i].accountNo,'status':clientAccountData.savingsAccounts[i].status};
                                angular.extend(savingsdata, clientsData);
                                scope.savingResults.push(savingsdata);
                            }                               
                        }
                     });
                });
            	
            };


            scope.routeTo = function (loanId, transactionId, transactionTypeId) {
                if (transactionTypeId == 2) {
                	var uri = '/viewloantrxn/' + loanId + '/trxnId/' + transactionId;
                    location.path(uri).search({isInterBranchSearch:'true',searchText:scope.formData.searchText,officeId: scope.formData.officeId});
                }
            };


            scope.makePayment = function(id){
            	var uri = '/loanaccount/'+id+'/repayment';
            	location.path(uri).search({isInterBranchSearch:'true',searchText:scope.formData.searchText,officeId: scope.formData.officeId});
            };

            scope.getAccount = function(id,type){
            	if(type ==scope.loanView){
            		resourceFactory.interBranchLoanAccountResource.get({loanId: id}, function (data) {
                        scope.view = type;
            			scope.loandetails = data;
                        scope.loandetails.transactions =  _.sortBy(scope.loandetails.transactions, 'id').reverse();
            		 });

            	}else{
                    resourceFactory.interBranchSavingAccountResource.get({accountId: id}, function (data) {
                        scope.view = type;
                        scope.savingaccountdetails = data;
                        scope.savingaccountdetails.transactions =  _.sortBy(scope.savingaccountdetails.transactions, 'id').reverse();
                    });  
            	}
            };

            scope.deposit = function(id){
                var uri = '/savingaccount/'+id+'/deposit';
                location.path(uri).search({isInterBranchSearch:'true',searchText:scope.formData.searchText,officeId: scope.formData.officeId});
            };

            scope.withdrawal = function(id){
                var uri = '/savingaccount/'+id+'/withdrawal';
                location.path(uri).search({isInterBranchSearch:'true',searchText:scope.formData.searchText,officeId: scope.formData.officeId});
                
            };

            scope.changeTransactionSort = function(column) {
                var sort = scope.transactionSort;
                if (sort.column == column) {
                    sort.descending = !sort.descending;
                } else {
                    sort.column = column;
                    sort.descending = true;
                }
            };
            scope.isDebit = function (savingsTransactionType) {
                return savingsTransactionType.withdrawal == true || savingsTransactionType.feeDeduction == true
                    || savingsTransactionType.overdraftInterest == true || savingsTransactionType.withholdTax == true || savingsTransactionType.amountHold == true || 
                    savingsTransactionType.code == scope.interBranchWithdrawalCode;
            };
            
            scope.isHoldOrRelease = function (savingsTransactionType) {
                return  savingsTransactionType.amountHold == true ||  savingsTransactionType.amountRelease == true;
            };

            scope.setView = function(type){
            	scope.view = type;
            };

            scope.undoTransaction = function (accountId, transactionId) {
                    var params = {loanId: accountId, transactionId: transactionId};
                    var formData = {dateFormat: scope.df, locale: scope.optlang.code, transactionAmount: 0};
                    formData.transactionDate = dateFilter(new Date(), scope.df);
                    resourceFactory.interBranchUndoLoanTxnsResource.undo(params, formData, function (data) {                        
                        scope.getAccount(accountId,scope.loanView);
                    });
            };

            scope.undoSavingTransaction = function(accountId, transactionId){
                var params = {savingsId: accountId, transactionId: transactionId};
                    var data = {dateFormat: scope.df, locale: scope.optlang.code, transactionAmount: 0};
                    data.transactionDate = dateFilter(new Date(), scope.df);
                    resourceFactory.interBranchUndoSavingTransactionResource.undo(params, data, function (data) {
                        scope.getAccount(accountId,scope.savingView);
                    });
            };
            

            scope.getFundTransferDetails = function(data){
                scope.fundTransferData = data;
                scope.view = scope.fundTransferView;
                var param = {};
                param.fromAccountId = data.accountNo;
                param.fromAccountType = scope.savingAccountType;
                param.toOfficeId = data.officeId;
                param.fromOfficeId = data.officeId;
                param.transferAmount = 0;
                param.toClientId = data.clientId;
                param.transferDate = new Date();
                param.toAccountType = scope.loanAccountType;
                param.isInterBranchSearch = true;

                resourceFactory.interBranchTransferTemplateResource.get(param, function (data) {
                    scope.toAccounts = data.toAccountOptions;
                    scope.transferData.transferAmount = data.transferAmount;
                    scope.transferData.transferDate = new Date();
                });

            };

            scope.submitFundTransfer = function(){
                resourceFactory.interBranchClientsResource.get({clientId: scope.fundTransferData.clientId}, function (clientData) {
                    scope.transferData.locale = scope.optlang.code;
                    scope.transferData.dateFormat = scope.df;
                    scope.transferData.toAccountType = scope.loanAccountType;
                    scope.transferData.fromAccountType = scope.savingAccountType;

                    scope.transferData.fromAccountId = scope.fundTransferData.id;

                    scope.transferData.fromClientId = scope.fundTransferData.clientId;
                    scope.transferData.toClientId = scope.fundTransferData.clientId;

                    scope.transferData.fromOfficeId = clientData.officeId;
                    scope.transferData.toOfficeId = clientData.officeId;
                    if (scope.transferData.transferDate){
                       scope.transferData.transferDate = dateFilter(scope.transferData.transferDate, scope.df); 
                    } 
                    resourceFactory.interBranchTransferResource.transfer({}, scope.transferData, function (data) {
                        scope.getAccount(scope.fundTransferData.id,scope.savingView);
                    });
                });
            };
        }
    });
    mifosX.ng.application.controller('SearchDetailsController', ['$scope', 'ResourceFactory', '$location', '$routeParams', 'dateFilter', '$routeParams', mifosX.controllers.SearchDetailsController]).run(function ($log) {
        $log.info("SearchDetailsController initialized");
    });
}(mifosX.controllers || {}));
