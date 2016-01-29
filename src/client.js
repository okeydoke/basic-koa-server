import 'babel-core/external-helpers.js';
import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import cn from 'classnames';

import './_repo.scss';

import fuzzySearch from './fuzzySearch';

import { Router, Route, Link, IndexRoute } from 'react-router';

function flatmap(a, f) {
	return [].concat.apply([], a.map(f));
}

var resolved = [];
function isResolved(name) { 
	return graph[name].every(k => resolved.indexOf(k) !== -1); 
}

function setProperty( arr, prop ) {

	return arr.map( v => {
		v[prop] = true; 
		return v; 
	});
}

const union = (...arrays) => [...Set([].concat(...arrays))];

function flattenDeps( dependencies ) {

	const bowerDeps = dependencies.bower.deps || [];
	const bowerDevDeps = dependencies.bower.dev || [];

	const npmDeps = dependencies.npm.deps || [];
	const npmDevDeps = dependencies.npm.dev || [];

	const bower = setProperty( [].concat( bowerDeps, setProperty(bowerDevDeps, 'dev') ), 'bower' );
	const npm = setProperty([].concat( npmDeps, setProperty(npmDevDeps, 'dev') ), 'npm' );

	return {bower, npm};

}

import marked from 'marked';


class RepoDetails extends Component {

	constructor (props) {
		super(props);
	}

	componentWillReceiveProps(nextProps) {
		this.setState(
			dbData.filter( v => v.github_id == nextProps.params.github_id ).pop()
		);
	}

	componentWillMount() {
		this.setState(
			dbData.filter( v => v.github_id == this.props.params.github_id ).pop()
		);
	}

	render() {
		const dependencies = flattenDeps( this.state.dependencies );

		const readme = this.state.readme !== null ? marked(this.state.readme) : '<span>No README.md found</span>';
		return (
			<div>
				<Search />
				<div className="c-container c-flex">

					<div className="c-readme"> 
						<h1><a href={this.state.html_url}>{this.state.full_name}</a></h1>
						<div>
							<span className="c-italic">last push: {this.state.pushed_at}</span>
						</div>

						<div dangerouslySetInnerHTML={{__html: readme}} />

					</div>
					<div className="c-dependencies">
						<h3>Dependencies</h3>
						<div><span className={cn('c-dependency--icon', 'c-dependency--icon-bower')}></span></div>
						<ul className="c-repo-list">
							{ dependencies.bower.map( dep => {
								return <Dependency {...dep} />;
							}) }
						</ul>


						<div><span className={cn('c-dependency--icon', 'c-dependency--icon-npm')}></span></div>
						<ul className="c-repo-list">
							{ dependencies.npm.map( dep => {
								return <Dependency {...dep} />;
							}) }
						</ul>

					</div>
				</div>
			</div>
		);
	}

}


class Search extends Component {

	constructor (props) {
		super(props);
	}

	render() {
		return (
			<header className="c-header--container">
				<div className="c-search--input-wrapper">
					<Link className="c-header--logo" to={'/'}>fed-xplorer</Link>
					<input onChange={this.props.searchHandler} ref="search" className="c-search--input" placeholder="Search" type="text" />
				</div>
			</header>
		);
	}

}

class Repo extends Component {

	constructor (props) {
		super(props);
	}

	render() {

		return (
			<div className="c-repo-container">
				<Link className="c-repo-name" data={this.props} to={`/repo/${this.props.github_id}`}>{this.props.full_name}</Link>
			</div>

		);
	}
}

class Dependency extends Component {

	constructor (props) {
		super(props);
	}

	parseHref( val ) {
		var url;

		if( val && val.match(/^git@/) ) {
			url = val.substring( val.indexOf(':') + 1 ).replace('.git', '');
		} else {
			url = val.replace('//', '');
			url = url.substring( url.indexOf('/') + 1 ).replace('.git', '');
		}

		if( !url ){
			return '';
		}
		for( var i = 0, l = dbData.length; i < l; i++ ){
			if( dbData[i].full_name == url ){
				return dbData[i].github_id;
			}
		}

	}

	render() {

		let name = this.props.href === '' ? <span className={cn('c-repo--dependency-name')}>{this.props.name}</span> :
			<Link className={cn('c-repo--dependency-name')} to={`/repo/${this.parseHref(this.props.href)}`}>{this.props.name} </Link>;

		let externalLink = <span className={cn('c-dependency--icon', 'c-external-link')}></span>;

		return (
			<li className={cn('c-repo--dependency')}>
				{name}
				{ this.props.version ? <span className="c-repo--dependency-version">{this.props.version}</span> : null }
				{ this.props.dev ? <span className="c-repo--dependency-dev">dev</span> : null }
				{ this.props.href === ''? <a href={`https://www.npmjs.com/package/${this.props.name}`} target="_blank">{externalLink}</a> : null }
			</li>
		);
	}

}

class Container extends Component {

	constructor (props) {
		super(props);
		console.log('props', props);
	}

	componentWillMount() {
		this.setState( {searchValue: ''} );
	}

	searchFunction(needle, haystack) {
		return fuzzySearch( needle.toLowerCase(), haystack.toLowerCase());
	}

	search( event ) {
		this.setState( {
			searchValue: event.target.value
		});
	}

	render() {
		let data = this.props.route.data;
		let repos = data.filter( v => this.searchFunction(this.state.searchValue, v.full_name) ).map( data => {
			return <Repo key={data.github_id} {...data} />;
		});

		return (
			<div>
				<Search searchHandler={this.search.bind(this)} />
				<div className="c-container">{repos}</div>
			</div>
		);
	}
};

function handleContentLoaded () {

	ReactDOM.render(
		<Router>
			<Route path="/" data={dbData} component={Container}>
			</Route>
		<Route path="repo/:github_id" component={RepoDetails}/>

		</Router>, document.getElementById('app')
	);
	document.removeEventListener('DOMContentLoaded', handleContentLoaded, false);
}
// <Route path="*" data={dbData} component={Container} />
// 
// window.fetch('/repos').then(function(res){
// 	return res.json();
// }).then(function(json){
// 	dbData = json;
// 	// graph( json );
// 	handleContentLoaded();
// });

if (document.readyState && document.readyState !== 'loading') {
	handleContentLoaded();
} else {
	document.addEventListener('DOMContentLoaded', handleContentLoaded, false);
}
