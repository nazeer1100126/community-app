(function (module) {
    mifosX.controllers = _.extend(module, {
        ManageSurveysController: function (scope, resourceFactory, location,WizardHandler) {
            scope.surveys = [];
            scope.step = 1;
            scope.noOfTabs = 2;
            scope.showQForm = false;
            scope.showOptForm = false;
            scope.showQBtn = true;
            scope.showOptBtn = false;
            //this will cause the step to be hidden
            scope.disabled = 'true';
            scope.question = {
                responseDatas: []
            };
            scope.option = {};
            scope.formData = {
                questionDatas: []
            };

            scope.showQuestions = false;
            resourceFactory.surveyResource.get(function(data){
                scope.surveys = data;
            });

            /*scope.submitDetails = function () {    
             console.log('out');                   
                if (WizardHandler.wizard().getCurrentStep() != scope.noOfTabs) {
                    WizardHandler.wizard().next();
                    console.log('in');

                }
            }*/
            scope.showQuestionsForm = function(){
                if(scope.formData.key != undefined && scope.formData.key.length>0 &&  
                    scope.formData.name != undefined && scope.formData.name.length>0 && 
                    scope.formData.countryCode != undefined && scope.formData.countryCode.length>0){
                    scope.showQuestions = true; 
                }
                
            }
            scope.checkBasicDetails = function(){
                return false;
            }
            scope.showQuestionForm = function(){
                scope.showQForm = true;
                scope.showQBtn = false;
                scope.showOptBtn = true;
            }
            scope.showOptionForm = function(){
                scope.showOptForm = true;
                scope.showOptBtn = false;
            }
            scope.discardOpt = function(){
                scope.option = {};
                scope.showOptForm = false;
                scope.showOptBtn = true;
            }
            scope.deleteOption = function(index){
                scope.question.responseDatas.splice(index,1);
                for (var i = 0; i < scope.question.responseDatas.length; i++) {
                    scope.question.responseDatas[i].sequenceNo = i + 1;
                }
            }

            scope.editOption = function(index){
                scope.option = scope.question.responseDatas[index];
                scope.showOptionForm();                
            }

            scope.deleteQuestion = function(index){
                scope.formData.questionDatas.splice(index,1);
                for (var i = 0; i < scope.formData.questionDatas.length; i++) {
                    scope.formData.questionDatas[i].sequenceNo = i + 1;
                }
            }
            scope.discardQuestion = function(){
                scope.option = {};
                scope.showOptForm = false;
                scope.showOptBtn = false;
                scope.question = {
                    responseDatas: []
                };
                scope.showQBtn =true;
                scope.showQForm = false;

            }
            scope.addOpt = function(){
                if(scope.isValidOption(scope.option)){
                    if(scope.isOptionForUpdate(scope.option)){
                        scope.updateOption(scope.option);
                    }else{
                        scope.option.sequenceNo = scope.question.responseDatas.length + 1;
                        scope.question.responseDatas.push(scope.option); 
                    }                    
                    scope.option = {};
                    scope.showOptForm = false;
                    scope.showOptBtn = true;
                }                
            }

            scope.updateOption = function(data){
                scope.question.responseDatas[data.index].text = data.text;
                scope.question.responseDatas[data.index].value = data.value;
            }

            scope.isOptionForUpdate = function(data){
                return (data.index != undefined);
            }

            scope.isValidOption = function(data){
                return (data.value != undefined  && data.text != undefined && data.text.length >0);
            }

            scope.addQuestion = function(){
                if(scope.question.responseDatas.length == 0){
                    alert("Cannot add question without options");
                    return;
                }
                scope.question.sequenceNo = scope.formData.questionDatas.length + 1;
                scope.formData.questionDatas.push(scope.question);
                scope.discardQuestion();
            }
            scope.createSurvey = function(){
                resourceFactory.surveyResource.save(scope.formData,function(data){
                    location.path('/surveys');
                });
            }
        }
    });

    mifosX.ng.application.controller('ManageSurveysController', ['$scope', 'ResourceFactory', '$location','WizardHandler', mifosX.controllers.ManageSurveysController]).run(function ($log) {
        $log.info("ManageSurveysController initialized");
    });
}(mifosX.controllers || {}));