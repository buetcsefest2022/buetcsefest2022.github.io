/*******************************************************************************/
/*****                         UTM Parameters                              *****/
/*******************************************************************************/

const BACKEND_URL = "https://bcf22-userdata.onrender.com";

let utmQuery = decodeURIComponent(window.location.search.substring(1)),
  utmVariables = utmQuery.split('&'),
  ParameterName,
  utm_itr;


const getUTMValue = (inputParameter) => {
    for (utm_itr = 0; utm_itr < utmVariables.length; utm_itr++) {
        ParameterName = utmVariables[utm_itr].split('=');
        if (ParameterName[0] === inputParameter) {
            return ParameterName[1] === null ? null : ParameterName[1];
        }
    }
}

const getUTMSource = ()=>{
    return getUTMValue('utm_source')
}

const getUTMMedium = ()=>{
    return getUTMValue('utm_medium')
}

const getUTMCampaign = ()=>{
    return getUTMValue('utm_campaign')
}

const getUTMContent = ()=>{
    return getUTMValue('utm_content')
}

const getUTMTerm = ()=>{
    return getUTMValue('utm_term')
}


const getParams = () => {
    return {
        source: getUTMSource(),
        medium: getUTMMedium(),
        campaign: getUTMCampaign(),
        term: getUTMTerm(),
        content: getUTMContent(),
    }
}



/*******************************************************************************/
/*****                               UUID                                  *****/
/*******************************************************************************/

const getUserId = () => {
    userId = uuidv4();

    return {
        userId
    }
}


/*******************************************************************************/
/*****                       Prepare & Send Data                           *****/
/*******************************************************************************/


const sendUserDataToServer = async () => {
    let userId = localStorage.getItem("userId");

    if(!userId){
        let userData = {}

        var parser = new UAParser();

        const userAgent = window.navigator.userAgent
        parser.setUA(userAgent)
        //console.log(parser.getResult());

        userData = parser.getResult()

        if (userData.device.type == null){
            userData.device.type = "desktop/laptop"
        }

        delete userData.browser.major

        let url = new URL(window.location.href)
        let urlSource = url.hostname.split('.')[0]

        if(urlSource == 'localhost' || urlSource == '127'){
            return
        }

        if(urlSource == 'buetcsefest2022'){
            urlSource = 'main'
        }

        userData.source = urlSource


        $.ajax('https://jsonip.com/')
        .then(
            function success(response) {
                userData.ip = response.ip
            },
    
            function fail(data, status) {
                console.log('Request failed.  Returned status of',
                            status);
            }
        );

        const userIdInfo = getUserId();
        userData.userId = userIdInfo.userId
        localStorage.setItem("userId", userData.userId);
        //console.log(userIdInfo)

        userData.utm = getParams()


        await navigator.geolocation.getCurrentPosition(function(position){
            latitude = position.coords.latitude;
            longitude = position.coords.longitude;

            //console.log(latitude, longitude);

            $.getJSON('https://api.geoapify.com/v1/geocode/reverse?lat='+latitude+'&lon='+longitude+'&apiKey=c43472efc7374853a471479c85954ee7', function(data) {

                let location = data.features[0].properties
                delete location.housenumber
                delete location.street
                delete location.county
                delete location.datasource
                delete location.distance
                delete location.result_type
                delete location.name
                delete location.formatted
                delete location.address_line1
                delete location.address_line2
                delete location.rank
                delete location.place_id
                delete location.county_code

                userData.location = data.features[0].properties
                console.log(userData)

                $.ajax(`${BACKEND_URL}/userdata`, {
                    data : JSON.stringify({"userData": userData}),
                    contentType : 'application/json',
                    type : 'POST',
                })
            });


        }, function(err) {

        } , {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
        });
    }

}


sendUserDataToServer()
