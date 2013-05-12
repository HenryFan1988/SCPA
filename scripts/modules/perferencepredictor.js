var PerferencenPredictor = {

    user_profiles:[],

    getProfileItems:function(callback){

        PersonalizationPredictor.user_profiles = [];

        IndexedDB.retriveData("user_profiles", function (e) {
            var result = e.target.result;

            if (result != null) {
                var value = result.value;

                if (value.UserId == sessionStorage.user_id) {
                    PersonalizationPredictor.user_profiles.push(
                        { time_stamp: value.time_stamp, pattern: value.TopicPattern, count: 0 }
                    );
                }
                result.continue();
            }
            else {
                callback();
            }


        });
    },

    countUsageItems:function(callback){

        var i = 0;

        IndexedDB.retriveData("user_usages", function (e) {
            var result = e.target.result;

            if (result != null) {
                var value = result.value;

                var start_time = PersonalizationPredictor.user_profiles[i].time_stamp;
                var end_time = PersonalizationPredictor.user_profiles[i + 1] == null ?
                    null : PersonalizationPredictor.user_profiles[i + 1].time_stamp;

                if (value.UserId == sessionStorage.user_id) {

                    var time = value.time_stamp;

                    if (time >= start_time && (end_time == null || time < end_time)) {
                        PersonalizationPredictor.user_profiles[i].count = ++PersonalizationPredictor.user_profiles[i].count;
                    }
                    else {
                        i++;
                        start_time = PersonalizationPredictor.user_profiles[i].time_stamp;
                        end_time = PersonalizationPredictor.user_profiles[i + 1].time_stamp;
                        user_profiles[i].count = ++PersonalizationPredictor.user_profiles[i].count;
                    }
                }
                result.continue();
            }
            else {
                callback();
            }
        });

    },

    training: function () {

        PersonalizationPredictor.getProfileItems(function () {

            PersonalizationPredictor.countUsageItems(function () {

                var input = [];

                    $.each(PersonalizationPredictor.user_profiles, function (index, value) {
                        var t = value.pattern;
                        var sucess = value.count > 20 ? 1 : 0;
                        t.push(sucess);
                        input.push(t);
                    });

                    localStorage.predition = predict(input);
            });

        });
        

       
    }
}