require 'digest/sha2'
require 'protected_attributes'

class User < ActiveRecord::Base
  attr_protected :hashed_password, :salt
  attr_accessor :password
  
  has_many :assigned_tickets, class_name: 'Ticket', foreign_key: 'assignee_id'
  has_many :reported_tickets, class_name: 'Ticket', foreign_key: 'reporter_id'
  has_many :developed_tickets, class_name: 'Ticket', foreign_key: 'developer_id'
  has_many :reviewed_tickets, class_name: 'Ticket', foreign_key: 'reviewer_id'
  has_many :tested_tickets, class_name: 'Ticket', foreign_key: 'tester_id'
  
  USERNAME_REGEX = /\A[\w_\-]+\z/i
  EMAIL_REGEX = /\A([\w\-_]+\.?[\w\-_]+)+@([\w\-_]+\.?[\w\-_]+)+\.[a-z]{2,4}\z/i
  
  validates :username, :length => {:within => 6..25}, :uniqueness => true, :format => {:with => USERNAME_REGEX}
  validates :email, :length => {:within => 6..255}, :format => {:with => EMAIL_REGEX}
  validates_length_of :password, :within => 8..25, :on => :create
  validates_confirmation_of :password, :on => :create
  
  before_save :create_hashed_password
  after_save :clear_password
  
  def self.make_salt(username="")
    Digest::SHA2.hexdigest("Use #{username} with #{Time.now} to make salt")
  end
  
  def self.hash_with_salt(password="", salt="")
    Digest::SHA2.hexdigest("Put #{salt} on the #{password}")
  end
  
  def self.authenticate(username="", password="")
    user = User.find_by_username(username)
    if user && user.does_password_match(password)
      return user
    else
      false
    end
  end
  
  def self.allowed_attributes
    %w(username first_name last_name email picture job_position skype phone)
  end
  
  def does_password_match(password="")
    hashed_password == User.hash_with_salt(password, salt)
  end
  
  def to_hash
    self.attributes.select{|key, value| User.allowed_attributes.include? key}
  end
  
  private
  
  def create_hashed_password
    unless password.blank?
      self.salt = User.make_salt(username) if salt.blank?
      self.hashed_password = User.hash_with_salt(password, salt)
    end
  end
  
  def clear_password
    self.password = nil
  end
  
end
