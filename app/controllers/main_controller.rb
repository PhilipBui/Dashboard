require 'httparty'
require 'json'
Url= 'https://api-impac-uat.maestrano.io/api/v1/get_widget'
UserId= '72db99d0-05dc-0133-cefe-22000a93862b'
PassId= '_cIOpimIoDi3RIviWteOTA'

EmployeeList = 'hr/employees_list' 
EmployeeDetails = 'hr/employee_details'
InvoiceList = 'invoices/list'
Metadata = 'metadata[organization_ids][]'
OrgId = 'org-fbte'
class MainController < ApplicationController
  include HTTParty
  def index
  end
  def employeeList
	response = HTTParty.get(Url, {
		:query => {'engine' => EmployeeList, Metadata => OrgId},
		:basic_auth => { :username => UserId, :password => PassId},
		:headers => { 'Accept:' => 'application/json'},
		:verify => false
	})
	render json: response
  end
  def employeeDetails
    response = HTTParty.get(Url, {
		:query => {'engine' => EmployeeDetails, Metadata => OrgId},
		:basic_auth => { :username => UserId, :password => PassId},
		:headers => { 'Accept:' => 'application/json'},
		:verify => false
	})
	render json: response
  end
  def invoiceList
    response = HTTParty.get(Url, {
		:query => {'engine' => InvoiceList, Metadata => OrgId},
		:basic_auth => { :username => UserId, :password => PassId},
		:headers => { 'Accept:' => 'application/json'},
		:verify => false
	})
	render json: response
  end
end
