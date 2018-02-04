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
    <p class="h5 left" style='margin-top:14px'>#102 - Expanding Content Push - External Tag</p>
</div></div>

<div class="row">
<div class='col-lg-6 col-md-6'>
<form id=builderForm enctype="multipart/form-data" onsubmit="return false">
<br>

	<table>
		<input type="hidden" name="format" value='push-tag'>
		<tr><td>Creative Width:</td>
			<td><select type="text" id='width' name="width" class="form-control">
				<option value='970'>970</option>
				<option value='900'>900</option>
				<option value='728'>728</option>
			    </select> 
			</td></tr>
		<tr><td>Collapsed Height:</td>
			<td><select type="text" id='collapsed_height' name="collapsed_height" class="form-control">
				<option value='60'>60</option>
				<option value='80'>80</option>
				<option value='90'>90</option>
			    </select> 
			</td></tr>
		<tr><td>Expanded Height:</td>
			<td><select type="text" id='expanded_height' name="expanded_height" class="form-control">
				<option value='250'>250</option>
				<option value='251'>251</option>
				<option value='200'>200</option>
			    </select>
			</td></tr>

		<tr><td>HTML tag:</td></tr>
		<tr><td colspan=2><textarea name='html_tag' style='height:300px'>
This is an example.
Expand and collapse are controlled from within the creative.

<a href='javascript:$sf.ext.expand()'>Expand:  $sf.ext.expand();</a>

<a href='javascript:$sf.ext.collapse()'>Collapse:  $sf.ext.collapse();</a></textarea></td></tr>

<!--		<tr><td>Create expand button:</td>
			<td><select type="text" id="create_button" name='create_button' class="form-control">
		    	<option value="0" selected>No</option>
		    	<option value="1">Yes</option>
		   	</select>
   			</td></tr>
-->
   		<tbody id='button_section' style='display:none'>
<input type="hidden" value='Abrir' name='expand_button'>
<input type="hidden" value='Cerrar' name='collapse_button'>
<!--
		<tr><td>Expand button text or base64 image:</td>
			<td><input type="text" value='Abrir' name='expand_button'></td></tr>

		<tr><td>Collapse button text or base64 image:</td>
			<td><input type="text" value='Cerrar' name='collapse_button'></td></tr>
-->
		</tbody>

		<tr><td>Initial State:</td>
			<td><select type="text" id="initial_state" name='initial_state' class="form-control">
		    	<option value="C">Collapsed</option>
		    	<option value="E" selected>Expanded</option>
		   	</select>
   			</td></tr>

   		<tbody id='autoclose_section'>
		<tr><td>Autoclose in seconds:</td>
			<td><input type="text" value='8' name='autoclose_seconds'></td></tr>
		</tbody>

		<tr><td>Create ClickTag Layer:</td>
			<td><select type="text" id="form3" name='clicktag_layer' class="form-control">
		    	<option value="1">Yes</option>
		    	<option value="0" selected>No</option>
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
        <button onclick='w.builder.submit()' class="btn btn-primary">Generate Creative</button>
        <div id='downloadButton'></div>
    </div>

</form>
</div>
</div><!-- mainPage -->

<div class="row"><div class='col-lg-12 col-md-12'>
<div id='demos' style='width:100%;border:1px solid #ccc'></div>
</div></div>

</div>
</main>
<!-- Contact form -->
<pre><code>
Example: 
Expand and collapse are controlled from within the creative.

&lt;a href='javascript:$sf.ext.expand()'&gt;Expand:  $sf.ext.expand();&lt;/a&gt;

&lt;a href='javascript:$sf.ext.collapse()'&gt;Collapse:  $sf.ext.collapse();&lt;/a&gt;
</code></pre>
