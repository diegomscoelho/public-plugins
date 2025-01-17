=head1 LICENSE

Copyright [1999-2015] Wellcome Trust Sanger Institute and the EMBL-European Bioinformatics Institute
Copyright [2016-2021] EMBL-European Bioinformatics Institute

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

=cut

package EnsEMBL::Web::ImageConfig::hsp_query_plot;

use strict;
use warnings;

use parent qw(EnsEMBL::Web::ImageConfig);

sub init_cacheable {
  my $self = shift;

  $self->SUPER::init_cacheable(@_);

  $self->set_parameters({
    label_width => 80, # width of labels on left-hand side
  });

  $self->create_menus('other');

  $self->add_tracks('other',
    [ 'scalebar',   '',         'HSP_scalebar',   { display => 'normal', strand => 'f', name => 'Scale bar',      col => 'black', description => 'Shows the scalebar' }],
    [ 'query_plot', 'HSPs',     'HSP_query_plot', { display => 'normal', strand => 'b', name => 'HSP Query Plot', col => 'red', dep => 50, txt => 'black', mode => 'allhsps' }],
    [ 'coverage',   'Coverage', 'HSP_coverage',   { display => 'normal', strand => 'f', name => 'HSP Coverage' }],
    [ 'legend',     '',         'HSP_legend',     { display => 'normal', strand => 'r', name => 'HSP Legend' }]
  );
}

1;
