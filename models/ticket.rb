class Ticket < ActiveRecord::Base
  belongs_to :sprint
  belongs_to :assignee, class_name: 'User'
  belongs_to :reporter, class_name: 'User'
  belongs_to :developer, class_name: 'User'
  belongs_to :reviewer, class_name: 'User'
  belongs_to :tester, class_name: 'User'
  enum :ticket_type => [:task, :bug]
  enum :status => [:opened, :todo, :inprogress, :review, :testing, :done]
  enum :resolution => [:resolved, :fixed, :wontfix, :cannotreproduce, :canceled, :duplicate, :asdesigned, :notvalid]
  
  def to_hash
    hash = self.attributes
    hash['ticket_type'] = self.ticket_type
    hash['status'] = self.status
    hash['resolution'] = self.resolution
    hash['assignee'] = self.assignee.nil? ? nil : self.assignee.to_hash
    hash['reporter'] = self.reporter.nil? ? nil : self.reporter.to_hash
    hash['developer'] = self.developer.nil? ? nil : self.developer.to_hash
    hash['reviewer'] = self.reviewer.nil? ? nil : self.reviewer.to_hash
    hash['tester'] = self.tester.nil? ? nil : self.tester.to_hash
    hash
  end
  
end
