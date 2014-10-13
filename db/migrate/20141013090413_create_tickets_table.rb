class CreateTicketsTable < ActiveRecord::Migration
  def change
    create_table :tickets do |table|
      table.belongs_to :sprint
      table.references :assignee
      table.references :reporter
      table.references :developer
      table.references :reviewer
      table.references :tester
      table.string 'ticket_type' # bug | task
      table.string 'status' # opened | reopened | todo | inprogress | review | testing | done
      table.string 'resolution' # resolved | fixed | wontfix | notreproducible | canceled | duplicate | asdesigned | invalid
      table.string 'summary'
      table.string 'description'
      table.timestamps
    end
    add_index :tickets, 'sprint_id'
    add_index :tickets, 'assignee_id'
    add_index :tickets, 'reporter_id'
    add_index :tickets, 'developer_id'
    add_index :tickets, 'reviewer_id'
    add_index :tickets, 'tester_id'
  end
end
