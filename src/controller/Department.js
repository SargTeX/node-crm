var Department = require('../model/Department.js');

exports.setup = function(app) {
	app.get('/DepartmentView', function(req, res, jump) {
		if (!res.locals.session) return res.send({status: 'error', template: 'PermissionError', errors: ['Du musst angemeldet sein.']});

		res.locals.session.hasPermission('department.canEdit', function(err, has) {
			if (err) return jump(err);
			if (!has) return res.send({status: 'error', template: 'PermissionError', errors: ['Du hast nicht die notwendigen Berechtigungen, um Abteilungen bearbeiten zu können.']});

			Department.findById(req.query.departmentId)
				.populate('fields')
				.exec(function(err, department) {
					if (err) return jump(err);
					if (!department) return res.send({status: 'error', template: 'Error', errors: ['Die angeforderte Abteilung konnte nicht gefunden werden.']});

					department.fields.sort(function(a, b) {return a.position-b.position;});
					res.send({template: 'DepartmentView', data: {department: department}});
				});
		});
	});

	app.get('/DepartmentAdd', function(req, res, jump) {
		if (!res.locals.session) return res.send({status: 'error', template: 'PermissionError', errors: ['Du musst angemeldet sein.']});

		res.locals.session.hasPermission('department.canAdd', function(err, has) {
			if (err) return jump(err);
			if (!has) return res.send({status: 'error', template: 'PermissionError', errors: ['Du hast nicht die Berechtigung, um neue Abteilungen anzulegen.']});

			res.send({template: 'DepartmentAdd'});
		});
	});

	app.post('/DepartmentAdd', function(req, res, jump) {
		if (!res.locals.session) return res.send({status: 'error', template: 'PermissionError', errors: ['Du musst angemeldet sein.']});

		res.locals.session.hasPermission('department.canAdd', function(err, has) {
			if (err) return jump(err);
			if (!has) return res.send({status: 'error', template: 'PermissionError', errors: ['Du hast nicht die Berechtigung, um neue Abteilungen anzulegen.']});
			if (!req.body.name) return res.send({status: 'error', template: 'DepartmentAdd', errors: ['Du musst einen Namen angeben.']});

			var department = new Department({name: req.body.name, email: req.body.email});
			if (!department.email) return res.send({status: 'error', template: 'DepartmentAdd', errors: ['Die Abteilung benötigt eine E-Mail Adresse.']});

			department.save(function(err) {
				if (err) return jump(err);
				res.send({status: 'success', template: 'DepartmentAdd'});
			});
		});
	});

	app.get('/DepartmentList', function(req, res, jump) {
		if (!res.locals.session) return res.send({status: 'error', template: 'PermissionError', errors: ['Du musst angemeldet sein.']});

		res.locals.session.hasPermission('department.canList', function(err, has) {
			if (err) return jump(err);
			if (!has) return res.send({status: 'error', template: 'PermissionError', errors: ['Du besitzt nicht die notwendigen Berechtigungen, um dir alle Abteilungen anzeigen zu lassen.']});

			Department.find({})
				.sort('name')
				.exec(function(err, departments) {
					if (err) return jump(err);

					res.send({template: 'DepartmentList', data: {departments: departments}});
				});
		});
	});

	app.get('/DepartmentDelete', function(req, res, jump) {
		if (!res.locals.session) return res.send({status: 'error', template: 'PermissionError', errors: ['Du musst angemeldet sein.']});

		res.locals.session.hasPermission('department.canDelete', function(err, has) {
			if (err) return jump(err);
			if (!has) return res.send({status: 'error', template: 'PermissionError', errors: ['Du besitzt nicht die notwendigen Berechtigungen, um Abteilungen entfernen zu können.']});

			Department.findById(req.query.departmentId)
				.exec(function(err, department) {
					if (err) return jump(err);
					if (!department) return res.send({status: 'success', template: 'DepartmentDelete'});

					department.remove(function(err) {
						if (err) return jump(err);
						res.send({status: 'success', template: 'DepartmentDelete', data: {name: department.name}});
					});
				});
		});
	});

	app.get('/DepartmentEdit', function(req, res, jump) {
		if (!res.locals.session) return res.send({status: 'error', template: 'PermissionError', errors: ['Du musst angemeldet sein.']});

		res.locals.session.hasPermission('department.canEdit', function(err, has) {
			if (err) return jump(err);
			if (!has) return res.send({status: 'error', template: 'PermissionError', errors: ['Du besitzt nicht die notwendigen Berechtigungen, um Abteilungen bearbeiten zu können.']});

			Department.findById(req.query.departmentId)
				.exec(function(err, department) {
					if (err) return jump(err);
					if (!department) return res.send({status: 'error', template: 'Error', errors: ['Die Abteilung konnte nicht gefunden werden.']});

					res.send({template: 'DepartmentEdit', data: {department: department}});
				});
		});
	});

	app.post('/DepartmentEdit', function(req, res, jump) {
		if (!res.locals.session) return res.send({status: 'error', template: 'PermissionError', errors: ['Du musst angemeldet sein.']});

		res.locals.session.hasPermission('department.canEdit', function(err, has) {
			if (err) return jump(err);
			if (!has) return res.send({status: 'error', template: 'PermissionError', errors: ['Du besitzt nicht die notwendigen Berechtigungen, um Abteilungen bearbeiten zu können.']});

			Department.findById(req.body.departmentId)
				.exec(function(err, department) {
					if (err) return jump(err);
					if (!department) return res.send({status: 'error', template: 'Error', errors: ['Die Abteilung konnte nicht gefunden werden.']});

					department.name = req.body.name;
					department.email = req.body.email;
					if (!department.email) return res.send({status: 'error', template: 'DepartmentEdit', data: {department: department}, errors: ['Die Abteilung benötigt eine E-Mail Adresse.']});
					department.save(function(err) {
						if (err) {
							if (err.code == 11000) return res.send({status: 'error', template: 'DepartmentEdit', errors: ['Der Name ist bereits vergeben.'], data: {department: department}});
							return jump(err);
						}

						res.send({status: 'success', template: 'DepartmentEdit', data: {department: department}});
					});
				});
		});
	});
};