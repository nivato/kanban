class Ticket < ActiveRecord::Base
  belongs_to :sprint
  belongs_to :assignee, class_name: 'User'
  belongs_to :reporter, class_name: 'User'
  belongs_to :developer, class_name: 'User'
  belongs_to :reviewer, class_name: 'User'
  belongs_to :tester, class_name: 'User'
end
