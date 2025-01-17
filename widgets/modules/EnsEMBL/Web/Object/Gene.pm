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

package EnsEMBL::Web::Object::Gene;

use strict;

use JSON qw(from_json);

### Overwritting gxa_check function 
sub gxa_check {
  my $self = shift;

  return unless $SiteDefs::GXA;

  return 1; # not doing availability check anymore as it slows down the site, we are only checking if the site is up or down

#  my $ua    = LWP::UserAgent->new;
#  my $proxy = $self->hub->web_proxy;
#  $ua->proxy( 'http', $proxy ) if $proxy;
#  $ua->timeout(2);

#  my $gxa_url   = $SiteDefs::GXA_REST_URL.$self->hub->param('g');
#  my $response  = $ua->get($gxa_url);

#  return (grep /true|timeout/, $response->{_content}) ? 1 : 0;
}


### Overwritting pathway_check function 
sub pathway_check {
  my $self = shift;

  return unless ($SiteDefs::Pathway && scalar @{$self->getReactomeXrefs()} > 0);

  return 1;
}

sub getReactomeXrefs() {
  my $self   = shift;
  return $self->Obj->get_all_DBLinks('Reactome_gene');
}

1;
