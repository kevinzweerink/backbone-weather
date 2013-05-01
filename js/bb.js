(function($){
	
	var Forecast,
		Forecasts,
		SearchView,
		ForecastView,
		ForecastItemView,
		forecasts,
		forecastView,
		searchView;
		
	
	// This will pull data from Weather Underground
	// Parse data so that we can work with it
	// Validate our zip code, for sending to weather underground
	Forecast = Backbone.Model.extend({
		
		url : function(){
			return 'http://api.wunderground.com/api/7eaec3b21b154448/conditions/q/' + this.get('zip') + '.json';
		},
		
		parse : function( data , xhr ) {
			// Stores the data we want to work with
			// in a more convenent way to access it.
			// observation becomes an object{};
			var observation = data.current_observation,
				iconClass = '';

			if (!observation) {
				var icon = "";
			} else {
				var icon = observation.icon;
			}

			if (icon === "mostlycloudy" || icon === "mostlysunny" || icon === "partlycloudy" || icon === "partlysunny" || icon === "hazy" || icon === "fog") {
				iconClass = "&#xe003;";
			} else if ( icon === "clear" || icon === "sunny" || icon === "unknown") {
				iconClass = "&#xe006;";
			} else if ( icon === "cloudy" ) {
				iconClass = "&#xe005;";
			} else if ( icon === "chancerain" || icon === "rain" ) {
				iconClass = "&#xe001;";
			} else if ( icon === "chancetstorms" || icon === "tstorms" ) {
				iconClass = "&#xe004;"
			} else {
				iconClass = "&#xe006;"
			}	

			if (observation) {
				return {
					id: observation.display_location.zip,
					icon: iconClass,
					state: observation.display_location.state_name,
					zip: observation.display_location.zip,
					city: observation.display_location.city,
					temp: observation.temp_f
				}

			} else {
				return {
					icon:"nope"
				}
			}
		},
		
		sync : function(method, model, options) {
			options.dataType = 'jsonp';
			return Backbone.sync(method, model, options);
		},
		
		validate: function(options) {
			// checks for zip, which is stored in our
			// options parameter
			// ! is a shortcut for checking if a value exists
			if (!options.zip) {
				var error = 'Enter a <span class="error">valid</span> zip code',
					quip = 'dumbass';

				if ($("#zip-label").attr('data-state') === "unchanged") {
					$('#zip-label').fadeOut(300, function() {
						document.getElementById('zip-label').innerHTML = error;
						$('#zip-label').fadeIn(300);
					});
					$('#zip-label').attr('data-state','change1');
				} else if ( $("#zip-label").attr('data-state') === "change1" ) {
					$('#zip-label').append(",");
					window.setTimeout(function() {
						$('#zip-label').append(" ");
						window.setTimeout(function() {
							$('#zip-label').append($('<span id="quip" />'));
							window.setTimeout(function() {
								$('#quip').append("d");
								window.setTimeout(function() {
									$('#quip').append("u");
									window.setTimeout(function() {
										$('#quip').append("m");
										window.setTimeout(function() {
											$('#quip').append("b");
											window.setTimeout(function() {
												$('#quip').append("a");
												window.setTimeout(function() {
													$('#quip').append("s");
													window.setTimeout(function() {
														$('#quip').append("s");
													}, 70);
												}, 50);
											}, 30);
										}, 100);
									}, 50);
								}, 50);
							}, 50);
						}, 60);
					}, 50);
					
					$('#zip-label').attr('data-state','change2');
				} else if ( $('#zip-label').attr('data-state') === "change2" ) {
					$('#quip').addClass('underline');
				}

				return true;
			}
		}
		
	});
	
	// Contains a list (or array) of Forecast items
	Forecasts = Backbone.Collection.extend({
		
		model : Forecast
		
	});
	
	SearchView = Backbone.View.extend({
		
		events : {
			'click #search' : 'addZip',
		},
		
		initialize : function() {
			this.collection.on('add', this.clear, this);
		},
		
		addZip: function(e) {
			e.preventDefault();
			
			// this instantiates our Forecast Model
			// calls all the methods with Forecast
			this.model = new Forecast();
			
			this.model.on('error', this.toggleError, this)
			
			if ( this.model.set({ zip: this.$("#zip").val() },{validate:true}) ) {
				this.collection.add(this.model);
				this.toggleError();
			}
		},
		
		clear: function(){
			this.$("#zip").val('');
		},
		
		toggleError: function() {
			this.$('.alert').css('opacity','0');
		}
	});
	
	ForecastView = Backbone.View.extend({
		
		events: {
			'click .delete' : 'destroy'
		},
		
		initialize: function() {
			this.collection.on('add', this.render, this);
			this.collection.on('remove',this.remove, this);
		},
		
		render: function(model) {
			var view = new ForecastItemView({ id: model.get('zip'), model: model });
			this.$('tbody').append(view.el).closest('table').hide().fadeIn(300);
		},
		
		remove: function(model) {
			$( '#' + model.get('zip') ).fadeOut(300, $( '#' + model.get('zip') ).remove());
			
			// !this.collection.length checks to see
			// if there are no more items in collection
			// fadeout $el, defined in forecastView = newForecastView();
			if (!this.collection.length) {
				this.$el.fadeOut(300);
			}
		},
		
		destroy: function(e) {
			var id = $(e.currentTarget).closest('tr').attr('id');
			var model = this.collection.get(id);
			
			this.collection.remove(model);
		}
		
	});
	
	ForecastItemView = Backbone.View.extend({
		
		tagName: 'tr',
		template: _.template( $.trim( $('#forecast-template').html() ) ),
		
		initialize: function() {
			_.bindAll( this, 'render' );
			// fetch calls the Forecast.sync method,
			// pulling our data from WU.
			this.model.fetch({success: this.render});
		},
		
		render: function(model) {
			var content = this.template( model.toJSON() );
			this.$el.html(content);
			return this;
		}
		
	});
	
	forecasts = new Forecasts();
	searchView = new SearchView({
		el: $('#weather'),
		collection: forecasts,
	});
	forecastView = new ForecastView({
		el: $('#output'),
		collection: forecasts,
	});
	
})(jQuery);