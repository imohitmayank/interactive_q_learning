//////////////////
// MohitMayank.com
//////////////////

// gridworld settings
var cols, rows;
var w = 120;
var grid = [];

// var current;

// helper variable 
var tableWidth, tableHeight;
var max_reward = 0, min_reward = 0;
var color_gradient;
var compute = false;
var show_policy = false;
var show_highlight = false;
var framerate = 3;
var grid_size_mapping = {'small': 120, 'medium': 85, 'large' : 50}
var grid_speed_mapping = {'slow' : [1, 1], 'medium': [1, 10], 'fast' : [1, 100]}
var last_state = -1;
var episode_over = true;

var over_turns = 0;
var overall_turn_limit = 5;

// widgets
var reward_input;
var state_type_sel;
var discount_input;
var deterministic_prob_input;
var e_greedy_input;
var show_hide_policy;

// Q-learning 
var discount = 0.9;
// var learning_rate = 1;
var episodes = grid_speed_mapping['slow'][0];
var iteration_limit = grid_speed_mapping['slow'][1];
var deterministic_prob = 1;
var e_greedy = 1;

// SETUP
////////////////////
function setup() 
{  
  createCanvas(600, 600);
  w = 120;
  tableWidth = width * 1;
  tableHeight = height * 0.60;
  cols = floor(tableWidth/w);
  rows = floor(tableHeight/w);
  
  frameRate(framerate);

  // set angle mode
  angleMode(DEGREES);

  // reset grid
  grid = [];
  episode_over = true;
  max_reward = 0, min_reward = 0;
  iteration_limit = grid_speed_mapping['slow'][1];


  // refill the grid
  for (var j = 0; j < rows; j++) {
    for (var i = 0; i < cols; i++) {
      var cell = new Cell(i, j);
      grid.push(cell);
    }
  }

  // populate settings text and widgets
  create_setting_menu_widgets();
  create_setting_menu_text();
}

// only the widgets
function create_setting_menu_widgets(){
  
  // creating setting module
  textAlign(LEFT, CENTER);
  noStroke();
  fill(0);
  
  // Gridworld dimensions
  ////////////////////////
  // selection to modify grid size
  grid_size_sel = createSelect();
  grid_size_sel.position(80, tableHeight + 70);
  grid_size_sel.option('small');
  grid_size_sel.option('medium');
  grid_size_sel.option('large');
  grid_size_sel.changed(grid_size_changed);

  // selection to modify grid size
  grid_speed_sel = createSelect();
  grid_speed_sel.position(80, tableHeight + 120);
  grid_speed_sel.option('slow');
  grid_speed_sel.option('medium');
  grid_speed_sel.option('fast');
  grid_speed_sel.changed(grid_speed_changed);

  ////////////////////////

  // States level
  ////////////////////////
  // Modify the states in enviroment, 
  reward_input = createInput('0');
  reward_input.position(300, tableHeight + 70);
  reward_input.size(50);
 
  // Selecting the type of state
  state_type_sel = createSelect();
  state_type_sel.position(290, tableHeight + 120);
  state_type_sel.option('normal');
  state_type_sel.option('terminal');
  state_type_sel.option('wall');
  // sel.changed(state_type_changed);
  
  // button to apply to all
  apply_to_all_button = createButton('Apply to all');
  apply_to_all_button.position(230, tableHeight + 160);
  apply_to_all_button.mousePressed(apply_to_all_clicked);
  //////////////////////

  // Agent level
  ////////////////////////
  // Change discount, 
  discount_input = createInput('0.9');
  discount_input.position(500, tableHeight + 70);
  discount_input.size(50);
 
  // Change randomness
  deterministic_prob_input = createInput('1');
  deterministic_prob_input.position(510, tableHeight + 120);
  deterministic_prob_input.size(50);
  
  // Change greedyness
  e_greedy_input = createInput('1');
  e_greedy_input.position(500, tableHeight + 165);
  e_greedy_input.size(50);
  //////////////////////

  // Execution level
  ////////////////////////
  // button to run the simulation
  run = createButton('Run/Stop');
  run.position(20, tableHeight + 220);
  run.mousePressed(toggle_compute);

  // button to reset
  reset = createButton('Reset');
  reset.position(150, tableHeight + 220);
  reset.mousePressed(reset_environment);

  // button to show policy
  show_hide_policy = createButton('Show/Hide Policy');
  show_hide_policy.position(250, tableHeight + 220);
  show_hide_policy.mousePressed(show_hide_policy_toggle);

  // button to show highlight
  show_highlight_button = createButton('Show/Hide Highlight');
  show_highlight_button.position(430, tableHeight + 220);
  show_highlight_button.mousePressed(show_highlight_toggle);
  ////////////////////////

}

function create_setting_menu_text(){

  // creating setting module
  textAlign(LEFT, CENTER);
  fill(0);
  
  // Main heading
  text("Environment builder", 10, tableHeight + 20);
  stroke(0);
  line(150, tableHeight + 20, 600, tableHeight + 20)
  line(80, tableHeight + 210, 600, tableHeight + 210)
  stroke(0, 75);
  line(195, tableHeight + 30, 195, tableHeight + 190)
  line(400, tableHeight + 30, 400, tableHeight + 190)
  noStroke();

  // Gridworld level
  /////////////////
  // subsection heading
  text("Gridworld level,", 10, tableHeight + 50);

  // Grid size
  text("Size:", 20, tableHeight + 85);

  // 
  text("Speed:", 20, tableHeight + 135);

  // States level
  ////////////////////////
  // subsection heading
  text("State level,", 200, tableHeight + 50);
  
  // Modify the states in enviroment, 
  text("Reward value: ", 210, tableHeight + 85);
 
  // Selecting the type of state
  text("State type: ", 210, tableHeight + 135);
  /////////////////////////

  // Agent level
  ////////////////////////
  // subsection heading
  text("Agent level,", 410, tableHeight + 50);
  
  // Future reward discount
  text("Discount: ", 420, tableHeight + 85);
 
  // Deterministic probability
  text("Deterministic: ", 420, tableHeight + 135);

  // E-greedy
  text("E-greedy: ", 420, tableHeight + 185);
  /////////////////////////

  // Execution level
  ////////////////////////
  text("Execution", 10, tableHeight + 210);
  ////////////////////////
}

// DRAW
/////////////////////////////////
function draw() {

  background(255);
  // clear();

  create_setting_menu_text();

  var episode_count = 0;
  // recalculate the gradient
  var color_from = color(0, 255, 0, 100);
  var color_to = color(255, 0, 0, 100);

  // if compute is true - calulate the value and perform gradient
  if (compute)
  {
    // perform one episode of q_learning
    if (episode_count < episodes){
      perfrom_q_learning();
      episode_count += 1;
    }

    reset_max_min_reward();

    for (var i = 0; i < grid.length; i++) 
    {
      if (min_reward != max_reward){
        var color_map = map(grid[i].value, min_reward, max_reward, 0, 1)
        grid[i].color =  lerpColor(color_to, color_from, color_map)
      }
      grid[i].show();
    }
  }
  else
  {
      // draw the grids
    for (var i = 0; i < grid.length; i++) 
    {
      grid[i].show();
    }
  }

}
/////////////////////////////////


// Callback funtion
//////////////////////

// modify the gridworld cell size and reset environment
function grid_size_changed(){  
  var new_value = grid_size_sel.value();
  new_value = grid_size_mapping[new_value];

  // if size is changed, reset with new cell width
  if (new_value != w) {
    w = new_value;
    // reset_environment();

    // as reset environment even resets the dropdown, PFB hack
    cols = floor(tableWidth/w);
    rows = floor(tableHeight/w);
    grid = [];
    max_reward = 0, min_reward = 0;
    episode_over = true;

    // refill the grid
    for (var j = 0; j < rows; j++) {
      for (var i = 0; i < cols; i++) {
        var cell = new Cell(i, j);
        grid.push(cell);
      }
    }
  }
}

//
function grid_speed_changed(){
  var new_value = grid_speed_sel.value();
  new_value = grid_speed_mapping[new_value];

  // modify the parameters factoring speed
  episodes = new_value[0];
  iteration_limit = new_value[1];
}

// show and hide policy arrows
function show_hide_policy_toggle(){
  
  // show policy
  if (show_policy) show_policy = false;
  else show_policy = true;
}

// show ro hide highlight
function show_highlight_toggle(){
  // show highlight
  if (show_highlight) show_highlight = false;
  else show_highlight = true;
}

// reset the environment
function reset_environment(){
  setup();
}

// toggle the compute boolean
function toggle_compute(){
  if (compute) compute = false;
  else compute = true;

  // reset the max min reward for color
  reset_max_min_reward();

  // reset the agent level settings
  discount = float(discount_input.value());
  deterministic_prob = float(deterministic_prob_input.value());
  e_greedy = float(e_greedy_input.value());
}

function apply_to_all_clicked(){
  for (var i = 0; i < grid.length; i++) {
    grid[i].value = reward_input.value();
    grid[i].type = state_type_sel.value();
  }

  reset_max_min_reward();
}

function reset_max_min_reward(){
  for (var i = 0; i < grid.length; i++) {
    if (grid[i].value < min_reward) min_reward = grid[i].value;
    if (grid[i].value > max_reward) max_reward = grid[i].value;
  }

}

function get_index(i, j) {
  if (i < 0 || j < 0 || i > cols-1 || j > rows-1) {
    return -1;
  }
  return i + j * cols;
}


// handle mouseClicks
function mouseClicked()
{
  if (mouseX < tableWidth && mouseY < tableHeight && mouseX != 0 && mouseY != 0)
  {
    // get the grid no
    var rowNo = Math.floor(mouseY/w);
    var colNo = Math.floor(mouseX/w);
  
    var current_index = get_index(colNo, rowNo);

    grid[current_index].reward = reward_input.value();
    grid[current_index].type = state_type_sel.value();
    grid[current_index].value = 0;

    // if (reward_input.value() > max_reward) max_reward = reward_input.value();
    // if (reward_input.value() < min_reward) min_reward = reward_input.value();

    // here if the reward is assigned to a state, 
    // replicate the rewards on the actions which bring to this state
    neighbours = grid[current_index].get_all_neighbors_action_index();
    for (i = 0; i < neighbours.length; i ++)
    {
      var index = neighbours[i][1]; 
      if (grid[index].type == 'wall'){
        if (neighbours[i][0] == 'top') grid[current_index].action_rewards['top'] = float(reward_input.value());
        if (neighbours[i][0] == 'bottom') grid[current_index].action_rewards['bottom'] = float(reward_input.value());
        if (neighbours[i][0] == 'left') grid[current_index].action_rewards['left'] = float(reward_input.value());
        if (neighbours[i][0] == 'right') grid[current_index].action_rewards['right'] = float(reward_input.value());
      }
      else if (state_type_sel.value() != 'wall') {
        if (neighbours[i][0] == 'top') grid[index].action_rewards['bottom'] = float(reward_input.value());
        if (neighbours[i][0] == 'bottom') grid[index].action_rewards['top'] = float(reward_input.value());
        if (neighbours[i][0] == 'left') grid[index].action_rewards['right'] = float(reward_input.value());
        if (neighbours[i][0] == 'right') grid[index].action_rewards['left'] = float(reward_input.value());
      }
    }
  }
}

function find_max(obj){
  return Math.max(...Object.values(obj))
}

function find_index_of_max_value(arr){
  // find max value
  var max_value = max(arr);
  var max_indices = [];
  for (x = 0; x < arr.length; x++){
    if (arr[x] == max_value) max_indices.push(x);
  }
  return sample_random(max_indices);
}

function find_key_with_max(obj){
  return Object.keys(obj).reduce((a, b) => obj[a] > obj[b] ? a : b);
}

function round_float(no, decimals){
  return Math.round(no * 10 ** decimals) / (10 ** decimals);
}

// Q-learning
/////////////////

// choose random element from array
function sample_random(array){
  return array[Math.floor(Math.random()*array.length)]
}

// returns random state except wall and terminals
function get_random_state(){
  // variable to hold available states
  var available_states = [];
  // find state which are of type normal
  for (i = 0; i < grid.length; i++){
    if (grid[i].type == 'normal') available_states.push(i);
  }
  // return one random
  return sample_random(available_states);
}

// get unvisted state by some probability
// function get_e_greedy_state(){
//   // variable to hold available states
//   var visited_states = [];
//   var not_visited_states = [];
//   // find state which are of type normal and visited or not visited
//   for (i = 0; i < grid.length; i++){
//     if (grid[i].type == 'normal'){
//       if (grid[i].value == 0) visited_states.push(i);
//       else not_visited_states.push(i);
//     } 
//   }
//   // corner case for start
//   if (visited_states.length == 0) visited_states = not_visited_states;
//   if (not_visited_states.length == 0) not_visited_states = visited_states;
//   // based on e-greedy select the state
//   if (Math.random() <= (1 - e_greedy)) return sample_random(visited_states);
//   else return sample_random(not_visited_states);
// }

// return true if game is over
function is_episode_over(current_pos){

  if (grid[current_pos].type == 'terminal') return true;
  else return false;
}

// main Q-learning function
function perfrom_q_learning(){

  // get the starting place
  // current_pos = get_random_state();
  if (episode_over == false) current_pos = last_state;
  else {
    current_pos = get_random_state();
    episode_over = false;
  }

  var iteration_count = 0;

  // while epsiode doesn't terminates
  while (!is_episode_over(current_pos) && (iteration_count < iteration_limit))
  {
    // increment
    iteration_count += 1;
    over_turns += 1;

    // highlight the current state
    if (show_highlight == true) grid[current_pos].highlight();

    // get all possible neighbors
    var valid_neighbors = grid[current_pos].get_neighbors_action_index();
    var possible_actions = ['top', 'right', 'bottom', 'left'];

    // select one action by e-greedy
    // var action = sample_random(valid_neighbors);
    var best_action_value_pair = grid[current_pos].get_next_best_action_value();
    // var best_action_index = possible_actions.indexOf(best_action_value_pair[0]);
    // var spliced_actions = [];
    // for (x = 0; x < possible_actions.length; x ++){
    //   if (possible_actions[x] != best_action_value_pair[0]) spliced_actions.push(possible_actions[x]);
    // }

    var selected_action;
    if (Math.random() <= (1 - e_greedy)) selected_action = best_action_value_pair[0];
    else selected_action = sample_random(possible_actions);

    // find the next state
    var next_state_pos = grid[current_pos].get_next_state_pos(selected_action);
    // console.log(current_pos, best_action_value_pair[0], selected_action, next_state_pos);

    // if no action present, go to random state and skip learning for this state
    if (valid_neighbors.length == 0) {
      next_state_pos = get_random_state();
    }

    // modify the current state's expected value
    grid[current_pos].value = round_float(best_action_value_pair[1], 2);
    // goto next state
    current_pos = next_state_pos;
    last_state = next_state_pos;
  }

  if (is_episode_over(current_pos) || (overall_turn_limit == over_turns)) {
    episode_over = true;
    over_turns = 0;
  }

}


// Cell definition
/////////////////////////
function Arrow(x,y,length){
  this.x=x;
  this.y=y;
  this.length = length;
  this.update = function(angle, length = this.length) {
    // var angle = atan2(mouseY-y, mouseX-x);
    push();
    translate(this.x,this.y);
    rotate(angle);

    this.length = length;
    
    beginShape()
    noStroke();
    vertex(0,-this.length);
    vertex(5*this.length, -this.length);
    vertex(5*this.length, -3*this.length);
    vertex(9*this.length, 0);
    vertex(5*this.length, 3*this.length);
    vertex(5*this.length, this.length);
    vertex(0,this.length);
    endShape(CLOSE);
    pop();
  }
}

function Cell(i, j) {
  this.i = i;
  this.j = j;
  this.walls = [true, true, true, true];
  this.action_rewards = {'top': 0, 'right': 0, 'left': 0, 'bottom': 0};
  this.visited = false;
  this.type = 'normal';
  this.value = '0';
  this.reward = 0;
  this.color = color(255, 255, 255, 0);
  this.arrow = new Arrow(i * w + w/2, j * w + w/2, 3);

  // return the list of vailid neighbors
  this.get_neighbors_action_index = function() {
    
    var neighbors = [];

    var top    = get_index(i, j -1);
    var right  = get_index(i+1, j);
    var bottom = get_index(i, j+1);
    var left   = get_index(i-1, j);
    
    if (top != -1 && grid[top].type != 'wall' ) neighbors.push(['top', top]);
    if (right != -1 && grid[right].type  != 'wall' ) neighbors.push(['right', right]);
    if (bottom != -1 && grid[bottom].type != 'wall' ) neighbors.push(['bottom', bottom]);
    if (left != -1 && grid[left].type   != 'wall' ) neighbors.push(['left', left]);

    return neighbors;
  }
  
  this.get_all_neighbors_action_index = function() {
    
    var neighbors = [];

    var top    = get_index(i, j -1);
    var right  = get_index(i+1, j);
    var bottom = get_index(i, j+1);
    var left   = get_index(i-1, j);
    
    if (top != -1) neighbors.push(['top', top]);
    if (right != -1) neighbors.push(['right', right]);
    if (bottom != -1) neighbors.push(['bottom', bottom]);
    if (left != -1) neighbors.push(['left', left]);

    return neighbors;
  }

  // Get the position of next best action
  this.get_next_best_action_value = function(){
    // get list of all po
    var possible_actions = ['top', 'bottom', 'right', 'left'];
    var state_future_rewards = [];
    var other_states_prob = (1 - deterministic_prob) / 3;

    //find the max future reward for each action and possible states
    for (var x = 0; x < possible_actions.length; x++){
      var action_reward = this.action_rewards[possible_actions[x]];
      var summed_action_state_reward = 0;
      for (var y = 0; y < possible_actions.length; y++){
          if (x != y){
            summed_action_state_reward += other_states_prob * grid[this.get_next_state_pos(possible_actions[y], 1)].value;
          }
          else{
            summed_action_state_reward += deterministic_prob * grid[this.get_next_state_pos(possible_actions[y], 1)].value;
          }

      }
      // apply discount
      summed_action_state_reward = action_reward + discount * summed_action_state_reward

      // add to list
      state_future_rewards.push(summed_action_state_reward);
    }

    // now find the max possible reward
    var max_index = find_index_of_max_value(state_future_rewards);
    // return 1. action with max future reward, and 2. the value of future reward
    return [possible_actions[max_index], state_future_rewards[max_index]]
  }

  // Get the index of next state, given current state and applied action
  this.get_next_state_pos = function(action, loc_deterministic_prob = 'null'){
    
    if (loc_deterministic_prob == 'null') loc_deterministic_prob = deterministic_prob;
    var next_state_pos = -1;
    var possible_actions = ['top', 'right', 'left', 'bottom'];
    var sliced_actions = [];
    var action_pos_mapping = {'top': get_index(i, j -1), 'right': get_index(i+1, j), 'bottom' : get_index(i, j+1), 'left': get_index(i-1, j)};
    // var action_pos_mapping_without_applied_action = {};
    for (var x = 0; x < possible_actions.length; x++){
      if (possible_actions[x] != action) {
        sliced_actions.push(possible_actions[x]);
      }
    }

    // suggest next state w.r.t. nondeterministic probability
    var random_number = Math.random();
    if (random_number <= loc_deterministic_prob) next_state_pos = action_pos_mapping[action];
    else next_state_pos = action_pos_mapping[sample_random(sliced_actions)];

    // if next state is not possible (out of grid or wall), return current state
    if (next_state_pos == -1)  next_state_pos = get_index(i, j);  
    // if (typeof(next_state_pos) == "undefined") debugger;
    if (grid[next_state_pos].type == 'wall') next_state_pos = get_index(i, j);  
        
    // return
    return next_state_pos;
  }

  this.update_value = function(){
      this.value = round_float(find_max(this.action_rewards), 2);
  }

  this.highlight = function() {
    var x = this.i*w;
    var y = this.j*w;
    noStroke();
    fill(0, 0, 255, 100);
    rect(x, y, w, w);
  }

  this.show = function() 
  {

    textAlign(CENTER, CENTER);
    fill(0, 0, 0);
    var x = this.i*w;
    var y = this.j*w;
    
    stroke(0);

    if (this.walls[0]) {
      line(x    , y    , x + w, y);
    }
    if (this.walls[1]) {
      line(x + w, y    , x + w, y + w);
    }
    if (this.walls[2]) {
      line(x + w, y + w, x    , y + w);
    }
    if (this.walls[3]) {
      line(x    , y + w, x    , y);
    }

    // write out the value
    // textSize(12);
    message = this.value
    if (this.reward != 0){
      message += "\nR: " + this.reward
    } 
    noStroke();
    text(message, x + w/2, y + w/2);
    fill(0, 102, 153);
    
    // color as per the cell type
    if(this.type == 'terminal')
    {
      noStroke();
      text('t', x + w - w/10, y + w - w/10);
      fill(0, 102, 153);      
    }
    else if(this.type == 'wall')
    {
      noStroke();
      fill(151, 151, 151);
      rect(x, y, w, w);
      this.value = 0;
    }
    else{
      // now color the environment
      noStroke();
      fill(this.color);
      rect(x, y, w, w);

    }

    // if we have to show policy
    if (show_policy == true && this.type != 'terminal' && this.type != 'wall'){
      
      // get the best neighbor and point to that
      var neighbors = this.get_all_neighbors_action_index();
      var max_score = -Infinity;
      var direction = 'na';
      for (var ii = 0; ii < neighbors.length; ii ++){
        var next_grid = grid[neighbors[ii][1]];
        if ((next_grid.value + int(next_grid.reward)) > max_score){
          max_score = next_grid.value + int(next_grid.reward) ;
          direction = neighbors[ii][0];
        }
      }

      var angle = 0;
      if (direction == 'top') angle = 270;
      if (direction == 'right') angle = 0;
      if (direction == 'bottom') angle = 90;
      if (direction == 'left') angle = 180;

      // if state is blocked, hide policy arrow
      if (direction != 'na') this.arrow.update(angle);
      else this.arrow.update(angle, 0)
    }  
  }
}