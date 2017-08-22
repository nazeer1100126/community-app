(function (module) {
    mifosX.controllers = _.extend(module, {
        ManageSurveysController: function (scope, resourceFactory, location,WizardHandler) {
            scope.surveys = [];
            
            scope.disabled = 'true';
            scope.question = {
                responseDatas: []
            };
            scope.option = {};
            scope.formData = {
                questionDatas: []
            };

            scope.showQuestions = false;
            resourceFactory.surveyResource.getAll(function(data){
                scope.surveys = data;
            });

            scope.showQuestionsForm = function(){
                if(scope.formData.key != undefined && scope.formData.key.length>0 &&  
                    scope.formData.name != undefined && scope.formData.name.length>0 && 
                    scope.formData.countryCode != undefined && scope.formData.countryCode.length>0){
                    scope.showQuestions = true; 
                }
                
            }
            
            scope.showQuestionForm = function(){
                scope.formData.questionDatas.push({});
            }
            scope.showOptionForm = function(question){
                if(question.responseDatas == undefined){
                    question.responseDatas = [];
                }
                question.responseDatas.push({});
            }
            scope.discardOpt = function(){
                scope.option = {};
            }
            scope.deleteOption = function(question,index){
                question.responseDatas.splice(index,1);
            }

            scope.deleteQuestion = function(index){
                scope.formData.questionDatas.splice(index,1);
            }
            scope.discardQuestion = function(){
                scope.option = {};
                scope.question = {
                    responseDatas: []
                };

            }
            scope.addOpt = function(){
                if(scope.isValidOption(scope.option)){
                    scope.option.sequenceNo = scope.question.responseDatas.length + 1;
                    scope.question.responseDatas.push(scope.option);                     
                    scope.option = {};
                }                
            }

            scope.isValidOption = function(data){
                return (data.value != undefined  && data.text != undefined && data.text.length >0);
            }

/*            scope.addQuestion = function(){
                if(scope.question.responseDatas.length == 0){
                    alert("Cannot add question without options");
                    return;
                }
                scope.question.sequenceNo = scope.formData.questionDatas.length + 1;
                scope.formData.questionDatas.push(scope.question);
                scope.discardQuestion();
            }*/

            scope.updateSequenceNumber = function(){
                if(scope.formData.questionDatas != undefined && scope.formData.questionDatas.length>0){
                    for(var i=0;i<scope.formData.questionDatas.length;i++){
                        scope.formData.questionDatas[i].sequenceNo = i + 1;
                        if(scope.formData.questionDatas[i].responseDatas != undefined && scope.formData.questionDatas[i].responseDatas.length>0){
                            for(var j=0;j<scope.formData.questionDatas[i].responseDatas.length;j++){
                                scope.formData.questionDatas[i].responseDatas[j].sequenceNo = j + 1;
                            }
                        }
                    }
                }   
            };

            scope.createSurvey = function(){
                scope.updateSequenceNumber();
                resourceFactory.surveyResource.save(scope.formData,function(data){
                    location.path('/surveys');
                });
            }

            scope.routeTo = function(id){
                location.path('/surveys/'+id);
            };
        }
    });

    mifosX.ng.application.controller('ManageSurveysController', ['$scope', 'ResourceFactory', '$location','WizardHandler', mifosX.controllers.ManageSurveysController]).run(function ($log) {
        $log.info("ManageSurveysController initialized");
    });
}(mifosX.controllers || {}));