# encoding: UTF-8
# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 20141013090413) do

  create_table "tickets", force: true do |t|
    t.integer  "assignee_id"
    t.integer  "reporter_id"
    t.integer  "developer_id"
    t.integer  "reviewer_id"
    t.integer  "tester_id"
    t.string   "ticket_type"
    t.string   "status"
    t.string   "summary"
    t.string   "description"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "tickets", ["assignee_id"], name: "index_tickets_on_assignee_id"
  add_index "tickets", ["developer_id"], name: "index_tickets_on_developer_id"
  add_index "tickets", ["reporter_id"], name: "index_tickets_on_reporter_id"
  add_index "tickets", ["reviewer_id"], name: "index_tickets_on_reviewer_id"
  add_index "tickets", ["tester_id"], name: "index_tickets_on_tester_id"

  create_table "users", force: true do |t|
    t.string   "username",        limit: 25, null: false
    t.string   "first_name",      limit: 25
    t.string   "last_name",       limit: 50
    t.string   "email",                      null: false
    t.string   "picture"
    t.string   "job_position"
    t.string   "skype"
    t.string   "phone"
    t.string   "hashed_password", limit: 65
    t.string   "salt",            limit: 65
    t.datetime "created_at"
    t.datetime "updated_at"
  end

end
