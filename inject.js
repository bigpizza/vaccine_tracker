
(function() {

	// just place a div at top right
	var div = document.createElement('div');
	div.style.position = 'fixed';
	div.style.top = 0;
	div.style.right = 0;
	div.textContent = 'Injected!';
	document.body.appendChild(div);

    let storeID = location.search.substring(4);

    var script = document.createElement('script');
    script.appendChild(document.createTextNode(`setTimeout(()=>{
        document.getElementById('covid_vaccine_search_input').value=95117;
        document.getElementById('fiftyMile-covid_vaccine_search').click();
        
        }, 3000);
        setTimeout(()=>{
            checkAvailabilityAndSearch();
        },4000);
        setTimeout(()=>{
            loadAssessmentForStore(${storeID}, 'COVID_VACCINE_SEARCH_TYPE_ZIP', '95117');
        },5000);

        setTimeout(()=>{
            document.getElementById('attestation_1002').checked='checked';
        },5500);
        
        
        `));
    (document.body || document.head || document.documentElement).appendChild(script);

})();