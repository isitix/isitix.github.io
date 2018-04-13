$(document).ready(() => {
    /*
        Gestion des cookies
     */
    var cookiesRegexp = /okcookies/;
    if(cookiesRegexp.test(document.cookie)=== false) {
        $('#cookiesBar').show();
    }
    $('#cookiesButton').on('click', function () {
        $('#cookiesBar').hide();
        let date = new Date();
        date.setTime(date.getTime() + (365*24*60*60*1000));
        document.cookie = "mynoteboat=okcookies; expires=" + date.toUTCString() + "; path=/";
    });

    /*
        Toggle the visibility of popup about the team
     */
    $('#popupTeamPresentation').on('click', function () {
        $('#teamPresentation').toggle();

    })
});