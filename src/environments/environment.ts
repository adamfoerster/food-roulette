// This file can be replaced during build by using the `fileReplacements` array.
// `ng build ---prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  firebase: {
    apiKey: 'AIzaSyDQ_T0maqTRm69YQZbsWylySld7lcaPmAI',
    authDomain: 'food-roulette-9415c.firebaseapp.com',
    databaseURL: 'https://food-roulette-9415c.firebaseio.com',
    projectId: 'food-roulette-9415c',
    storageBucket: '',
    messagingSenderId: '571763987438',
    vapid: {
      publicKey:
        'BIKlEqIz4GH-FGXMtlWgqSd3bh-MvOZc_NlrLM3jFhYqWpiMu0iAonnKQo5Zin5e04y4viGpnq9XXyRE8dfCDqM',
      privateKey: 'jukmIvN70JVEW6xfXtTYJJ_Nt03BVfjinghhl5Jvp_o'
    }
  }
};

/*
 * In development mode, to ignore zone related error stack frames such as
 * `zone.run`, `zoneDelegate.invokeTask` for easier debugging, you can
 * import the following file, but please comment it out in production mode
 * because it will have performance impact when throw error
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
