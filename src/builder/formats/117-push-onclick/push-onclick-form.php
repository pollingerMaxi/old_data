<!-- Contact form -->
<style>
td {height:50px;}
table { width:90%;}
.site-content {background-image:url(img/blue-bg.jpg);width:100%;
		height:200px;padding-top:90px;font-size:20px }
</style>
<main>
<div class="container">

<div class="row mt-5">
<div class='col-lg-12 col-md-12'>
    <p class="h5 left" style='margin-top:14px'>#117 - Expanding Content Push Onclick</p>
</div></div>

<div class="row">
<div class='col-lg-6 col-md-6'>
<form id=builderForm enctype="multipart/form-data" onsubmit="return false">
<br>

	<table>
		<tr><td>Collapsed Size:</td>
			<td><select type="text" id='collapsed_size' name="collapsed_size" class="form-control">
				<option value='320x90'>320x90</option>
				<option value='970x90'>970x90</option>
			    </select> 
			</td></tr>

		<tr><td>Expanded Size:</td>
			<td><select type="text" id='expanded_size' name="expanded_size" class="form-control">
				<option value='320x250'>320x250</option>
				<option value='970x250'>970x250</option>
			    </select> 
			</td></tr>
		<input type="hidden" name="format" value='push-onclick'>
<!--
		<tr><td>Collapsed Size:</td>
			<td><select type="text" name="collapsed_size" class="form-control">
				<option>970x90</option></select>
			</td></tr>

		<tr><td>Expanded Size:</td>
			<td><select type="text" name="expanded_size" class="form-control">
				<option>970x250</option></select>
			</td></tr>
-->		
		<tr><td>Collapsed zip or image:</td>
			<td><input type="file" name='collapsed_zip'></td></tr>

		<tr><td>Expanded zip or image:</td>
			<td><input type="file" name='expanded_zip'></td></tr>

<input type="hidden" value='Abrir' name='expand_button'>
<input type="hidden" value='Cerrar' name='collapse_button'>
<!--
		<tr><td>Expand button text or base64 image:</td>
			<td><input type="text" value='Abrir' name='expand_button'></td></tr>

		<tr><td>Collapse button text or base64 image:</td>
			<td><input type="text" value='Cerrar' name='collapse_button'></td></tr>
-->
		<tr><td>Initial State:</td>
			<td><select type="text" id="initial_state" name='initial_state' class="form-control">
		    	<option value="C">Collapsed</option>
		    	<option value="E" selected>Expanded</option>
		   	</select>
   			</td></tr>
<!--
   		<tbody id='autoclose_section'>
		<tr><td>Autoclose in seconds:</td>
			<td><input type="text" value='8' name='autoclose_seconds'></td></tr>
		</tbody>
-->
		<tr><td>Create ClickTag Layer:</td>
			<td><select type="text" id="form3" name='clicktag_layer' class="form-control">
		    	<option value="1">Yes</option>
		    	<option value="0">No</option>
		   	</select>
   			</td></tr>

		<tr><td>Clicktag URL:</td>
			<td><input type="text" value='www.google.com' name='clicktag_url'></td></tr>

		<tr><td>Animated transition:</td>
			<td><select type="text" id="form3" name='animated_transition' class="form-control">
		    	<option value="1">Yes, 0.25 seconds</option>
		    	<option value="2">Yes, 0.5 seconds</option>
		    	<option value="3">Yes, 0.75 seconds</option>
		    	<option value="4">Yes, 1 second</option>
		    	<option value="0">No</option>
		   	</select>
   			</td></tr>

<!--		<tr><td>Background Color:</td>
			<td><input type="text" value='white'></td></tr>
-->

	</table>

    <div class="text-center">
        <button onclick='w.builder.submit()' class="btn btn-primary">Upload and generate Creative</button>
         <div id='downloadButton'></div>
    </div>

</form>
</div>
</div><!-- mainPage -->


</div>
</main>