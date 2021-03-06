import Vue from 'vue';
import user_Profile from '../components/user/Profile.vue';
import { OmegaUp } from '../omegaup';
import T from '../lang';
import API from '../api.js';
import * as UI from '../ui';

OmegaUp.on('ready', function() {
  const payload = JSON.parse(document.getElementById('payload').innerText);
  const profile = payload.profile;
  let viewProfile = new Vue({
    el: '#user-profile',
    render: function(createElement) {
      return createElement('omegaup-user-profile', {
        props: {
          profile: this.profile,
          contests: this.contests,
          solvedProblems: this.solvedProblems,
          unsolvedProblems: this.unsolvedProblems,
          createdProblems: this.createdProblems,
          visitorBadges: this.visitorBadges,
          profileBadges: this.profileBadges,
          rank: this.rank,
          charts: this.charts,
          periodStatisticOptions: this.periodStatisticOptions,
          aggregateStatisticOptions: this.aggregateStatisticOptions,
        },
        on: {
          'update-period-statistics': (e, categories, data) => {
            e.periodStatisticOptions.xAxis.categories = categories;
            e.periodStatisticOptions.series = data;
          },
          'update-aggregate-statistics': e =>
            (e.aggregateStatisticOptions.series[0].data =
              e.normalizedRunCounts),
        },
      });
    },
    data: {
      profile: profile,
      contests: [],
      profileBadges: new Set(),
      solvedProblems: [],
      unsolvedProblems: [],
      createdProblems: [],
      visitorBadges: new Set(),
      charts: null,
      periodStatisticOptions: {
        title: {
          text: UI.formatString(T.profileStatisticsVerdictsOf, {
            user: profile.username,
          }),
        },
        chart: { type: 'column' },
        xAxis: {
          categories: [],
          title: { text: T.profileStatisticsPeriod },
          labels: {
            rotation: -45,
          },
        },
        yAxis: {
          min: 0,
          title: { text: T.profileStatisticsNumberOfSolvedProblems },
          stackLabels: {
            enabled: false,
            style: {
              fontWeight: 'bold',
              color: (Highcharts.theme && Highcharts.theme.textColor) || 'gray',
            },
          },
        },
        legend: {
          align: 'right',
          x: -30,
          verticalAlign: 'top',
          y: 25,
          floating: true,
          backgroundColor:
            (Highcharts.theme && Highcharts.theme.background2) || 'white',
          borderColor: '#CCC',
          borderWidth: 1,
          shadow: false,
        },
        tooltip: {
          headerFormat: '<b>{point.x}</b><br/>',
          pointFormat: '{series.name}: {point.y}<br/>Total: {point.stackTotal}',
        },
        plotOptions: {
          column: {
            stacking: 'normal',
            dataLabels: {
              enabled: false,
              color:
                (Highcharts.theme && Highcharts.theme.dataLabelsColor) ||
                'white',
            },
          },
        },
        series: [],
      },
      aggregateStatisticOptions: {
        title: {
          text: UI.formatString(T.profileStatisticsVerdictsOf, {
            user: profile.username,
          }),
        },
        chart: {
          plotBackgroundColor: null,
          plotBorderWidth: null,
          plotShadow: false,
          type: 'pie',
        },
        xAxis: {
          title: { text: '' },
        },
        yAxis: {
          title: { text: '' },
        },
        title: {
          text: UI.formatString(T.profileStatisticsVerdictsOf, {
            user: profile.username,
          }),
        },
        tooltip: { pointFormat: '{series.name}: {point.y}' },
        plotOptions: {
          pie: {
            allowPointSelect: true,
            cursor: 'pointer',
            dataLabels: {
              enabled: true,
              color: '#000000',
              connectorColor: '#000000',
              format:
                '<b>{point.name}</b>: {point.percentage:.1f} % ({point.y})',
            },
          },
        },
        series: [
          {
            name: T.profileStatisticsRuns,
            data: [],
          },
        ],
      },
    },
    computed: {
      rank: function() {
        switch (profile.classname) {
          case 'user-rank-unranked':
            return T.profileRankUnrated;
          case 'user-rank-beginner':
            return T.profileRankBeginner;
          case 'user-rank-specialist':
            return T.profileRankSpecialist;
          case 'user-rank-expert':
            return T.profileRankExpert;
          case 'user-rank-master':
            return T.profileRankMaster;
          case 'user-rank-international-master':
            return T.profileRankInternationalMaster;
        }
      },
    },
    components: {
      'omegaup-user-profile': user_Profile,
    },
  });

  API.User.contestStats({ username: profile.username })
    .then(function(data) {
      viewProfile.contests = data;
    })
    .catch(UI.apiError);

  API.User.problemsSolved({ username: profile.username })
    .then(function(data) {
      viewProfile.solvedProblems = data['problems'];
    })
    .catch(UI.apiError);

  API.User.listUnsolvedProblems({ username: profile.username })
    .then(function(data) {
      viewProfile.unsolvedProblems = data['problems'];
    })
    .catch(UI.apiError);

  API.User.problemsCreated({ username: profile.username })
    .then(function(data) {
      viewProfile.createdProblems = data['problems'];
    })
    .catch(UI.apiError);

  if (payload.logged_in) {
    API.Badge.myList({})
      .then(function(data) {
        viewProfile.visitorBadges = new Set(
          data['badges'].map(badge => badge.badge_alias),
        );
      })
      .catch(UI.apiError);
  }

  API.Badge.userList({ target_username: profile.username })
    .then(function(data) {
      viewProfile.profileBadges = new Set(
        data['badges'].map(badge => badge.badge_alias),
      );
    })
    .catch(UI.apiError);

  API.User.stats({ username: profile.username })
    .then(function(data) {
      viewProfile.charts = data;
    })
    .catch(UI.apiError);
});
