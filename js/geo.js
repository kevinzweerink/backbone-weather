$(document).ready(function() {
	function success(position) {
		var url = "http://maps.googleapis.com/maps/api/geocode/json?latlng=" + position.coords.latitude + "," + position.coords.longitude + "&sensor=false",
		req = $.ajax({
			url: url,
			dataType: "json",
			type: "GET",
			success: function(data) {
				console.log("wtf");
				$("#zip").val(data.results[0].address_components[6].long_name);
			}
		});
	}

	function error(position) {
		console.log('error finding position');
	}

	if(navigator.geolocation) {
	  navigator.geolocation.getCurrentPosition(success, error)
    } else {
      console.log("what");
    }

	$("#geo").on("click", function(e) {
	    e.preventDefault();
	    console.log("wtf");
	    if(navigator.geolocation) {
	      navigator.geolocation.getCurrentPosition(success, error)
	    } else {
	      console.log("what");
	    }
  	});
});